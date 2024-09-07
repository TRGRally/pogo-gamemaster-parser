import * as fs from 'fs';

class GameMasterExtractor {
    inputFile: string;

    constructor(inputFile: string) {
        this.inputFile = inputFile;
    }

    readJsonFile(callback: (objects: any[]) => void): void {
        fs.readFile(this.inputFile, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading ${this.inputFile}:`, err);
                return;
            }
            try {
                const objects = JSON.parse(data);
                callback(objects);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        });
    }

    extractPokemon(objects: any[]): void {
        const pokemon = objects.filter((object) => {
            return /^V\d{4}_POKEMON/.test(object.templateId);
        });
        //pokemon is currently an array of objects with form { templateId { data { templateId, everything else, etc.}}}
        //converts to array of objects with form { templateId, everything else, etc.}
        pokemon.forEach((object) => {
            object.data.templateId = object.templateId;
        });
        pokemon.forEach((object) => {
            delete object.templateId;
        });
        pokemon.forEach((object) => {
            Object.assign(object, object.data);
        });
        pokemon.forEach((object) => {
            delete object.data;
        });

        console.log(pokemon.length);

        const data = JSON.stringify(pokemon, null, 2);
        this.writeToFile('pokemon.json', data);

        //finds how many times each deep key occurs in the pokemon data
        let keyCount: { [key: string]: number } = {};
        
        const traverseObject = (obj: any, path: string) => {
            Object.keys(obj).forEach((key) => {
                const newPath = path ? `${path}.${key}` : key;
                if (keyCount[newPath]) {
                    keyCount[newPath]++;
                } else {
                    keyCount[newPath] = 1;
                }
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    traverseObject(obj[key], newPath);
                }
            });
        };
        
        pokemon.forEach((object) => {
            traverseObject(object, '');
        });
 
        const orderedKeyCount = Object.entries(keyCount).sort((a, b) => b[1] - a[1]);
        const keyCountData = JSON.stringify(orderedKeyCount, null, 2);
        this.writeToFile('keyCount.json', keyCountData);

        //no.pokemonSettings property
        const noSettings = pokemon.filter((object) => {
            return !object.pokemonSettings;
        });
        const data0 = JSON.stringify(noSettings, null, 2);
        this.writeToFile('pokemonNoSettings.json', data0);


        //empty pokemonSettings.camera objects 
        const noCamera = pokemon.filter((object) => {
            return object.pokemonSettings && 
                   object.pokemonSettings.camera && 
                   Object.keys(object.pokemonSettings.camera).length === 0;
        });
        const data1 = JSON.stringify(noCamera, null, 2);
        this.writeToFile('pokemonNoCamera.json', data1);


        //no .pokemonSettings.form property
        const noForms = pokemon.filter((object) => {
            return object.pokemonSettings && !object.pokemonSettings.form;
        });
        const data2 = JSON.stringify(noForms, null, 2);
        this.writeToFile('pokemonNoForms.json', data2);

        
    }

    extractFamilies(objects: any[]): void {
    const families = objects.filter((object) => {
        return /^V\d{4}_FAMILY/.test(object.templateId);
    })
    families.forEach((object) => {
        object.data.templateId = object.templateId;
    });
    families.forEach((object) => {
        Object.assign(object, object.data.pokemonFamily);
    });
    families.forEach((object) => {
        delete object.data;
    });

    const data = JSON.stringify(families, null, 2);
    this.writeToFile('families.json', data);
}

    writeToFile(filename: string, data: string): void {
        fs.writeFile(filename, data, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing to ${filename}:`, err);
            } else {
                console.log(`${filename} created successfully.`);
            }
        });
    }

    run(): void {
        this.readJsonFile((objects) => {
            this.extractPokemon(objects);
            this.extractFamilies(objects);
        });
    }


}


const extractor = new GameMasterExtractor('game_master/latest.json');
extractor.run();