# the-draw

Small app to do the draw according to the rules defined by nxtri.

![image](https://user-images.githubusercontent.com/1328417/201855087-2a3698bd-88d3-4430-8591-2cbee740e3b4.png)


### Getting started
To run it locally you need to install nodejs (nodejs.org), and download this code (the-draw repo) and run `npm install`. 

### Adding the ticket numbers
The code uses the file `/src/components/Norseman_ballot.csv` as source. To add your owm ticket numbers replace this file. (Use a standard excel file, and save it as CSV). Be careful to use the exact same format.

### Running the app
To run the app: `npm run dev` - this will start the app locally, load the file above, and do the draw. You may export the results.

### Features

**Skip Delay Checkbox**
- Located in the lower left corner of the interface
- **Checked (default)**: Fast drawing with 5ms delay between selections
- **Unchecked**: Original timing with 400ms delay for dramatic effect
- Setting is automatically saved and remembered between sessions using localStorage
- Useful for quick testing or when you want the excitement of watching each selection unfold

### The Draw Rules
The draw follows these specific rules implemented in `src/components/manager.ts`:

**Basic Configuration:**
- **Total slots**: 125 participants
- **Minimum female participants**: 15% (19 slots minimum)
- **Maximum male participants**: 85% (106 slots maximum)

**Country-based Rules:**
- **Norwegian participants**: Maximum 25% (31 slots)
- **Other countries**: Maximum 15% per country (18 slots each)

**Special Rules for Large Countries:**
- Countries with more than 100 ticket holders get additional female representation requirements
- Such countries must have at least 2 females among their selected participants when they have 2 or more total selections

**How it works:**
1. The system randomly selects athletes while respecting all the above quotas
2. If male quota is filled, only females can be selected
3. For countries with >100 participants, the system enforces female representation by temporarily forcing female selection when the country has selected 2+ people but fewer than 2 females

To modify these rules, edit the constants at the top of `src/components/manager.ts`:
- `TOTAL_SLOTS`: Total number of slots
- `FEMALE_COUNT`: Minimum female percentage  
- `MAX_NORWEGIAN_COUNT`: Maximum slots for Norwegian participants
- `MAX_COUNTRY_COUNT`: Maximum slots per country (other than Norway)
- `THRESHOLD_TO_APPLY_MIN_COUNT_GIRLS_`: Threshold for applying special female rules
- `MIN_COUNT_GIRLS_WHEN_COUNTRY_COUNT_ABOVE_THRESHOLD`: Minimum females required from large countries

Good luck!

(below is the default vue readme for devs)

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
