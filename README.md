# pogo-gamemaster-parser
 Exploring the pokemon go gamemaster file. code is temporary for now.

## ideas / findings

- templateId of V####_POKEMON... = all pokemon
- all gamemaster entries are in the form seen below which wastes space, can be simplified to a map of `templateId -> data` or by flattening the data object to the same level as templateId and absorbing the duplicate

```json
{
  "templateId": "string",
  "data": {
    "templateId": "string",
    ...
  }
}
```

- any pokemon with an empty pokemonSettings.camera object is yet to be released
- rayquaza is the only pokemon that requires an item to mega evolve. this gives it keys "nonTmCinematicMoves" and "exclusiveKeyItem". zygarde complete form is the only other pokemon with the "exclusiveKeyItem" key. these are add-ons and dont require treating other pokemon differently when parsing.
- each pokemon satisfies varying degrees of a certain set of keys. need to determine what the set of always satisfied keys are, create a base type, then create types for different categories of pokemon depending on the keys they satisfy.
- all pokemon without a .pokemonSettings object are pokemon home fallback forms. these can be ignored when reasoning about the game.