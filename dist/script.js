"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class GameMasterExtractor {
    constructor(inputFile) {
        this.inputFile = inputFile;
    }
    readJsonFile(callback) {
        fs.readFile(this.inputFile, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading ${this.inputFile}:`, err);
                return;
            }
            try {
                const objects = JSON.parse(data);
                callback(objects);
            }
            catch (error) {
                console.error('Error parsing JSON:', error);
            }
        });
    }
    extractPokemon(objects) {
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
        let keyCount = {};
        const traverseObject = (obj, path) => {
            Object.keys(obj).forEach((key) => {
                const newPath = path ? `${path}.${key}` : key;
                if (keyCount[newPath]) {
                    keyCount[newPath]++;
                }
                else {
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
    extractFamilies(objects) {
        const families = objects.filter((object) => {
            return /^V\d{4}_FAMILY/.test(object.templateId);
        });
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
    writeToFile(filename, data) {
        fs.writeFile(filename, data, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing to ${filename}:`, err);
            }
            else {
                console.log(`${filename} created successfully.`);
            }
        });
    }
    run() {
        this.readJsonFile((objects) => {
            this.extractPokemon(objects);
            this.extractFamilies(objects);
        });
    }
}
const extractor = new GameMasterExtractor('game_master/latest.json');
extractor.run();
