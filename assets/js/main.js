const {
    createApp,
    ref,
    reactive
} = Vue;


const app = createApp({
    setup() {
        const grids = [
            {
                label: '4 x 4',
                value: '8'
            },
            {
                label: '6 x 6',
                value: '18'
            },
            {
                label: '8 x 8',
                value: '32'
            }
        ];

        const prompt = ref(true);
        const name = ref('');
        const grid = ref('8');
        const characters = ref([]);
        const selectedItems = ref([]);


        const validateName = value => {
            if (!value && name.value.trim().length == 0) prompt.value = true;
        }

        const getRndIds = length => {
            const max = 672;
            const min = 1;
            const ids = [];
            for (let i = 0; i < length; i++) {
                ids.push(
                    //Returns a random number between min (inclusive) and max (exclusive)
                    Math.floor(
                        Math.random() * (max - min) + min
                    )
                )

            }
            return ids;
        };

        const getCharacters = async (event) => {
            const ids = getRndIds(grid.value);

            const response = await fetch("https://rickandmortyapi.com/graphql", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `{
                        charactersByIds(ids: [${ids}]) {
                            id,
                            name,
                            image
                        }
                    }`
                })
            });

            const result = await response.json();

            characters.value = [...result.data.charactersByIds, ...result.data.charactersByIds]
                .sort(() => .5 - Math.random());;
        };

        const flipCard = event => {
            const element = event.target;
            const img = element.closest('.img');

            if (selectedItems.value.length < 2 || selectedItems.value.find(item => item.id == img.id)) {
                if (!selectedItems.value.find(item => item.id == img.id)) {
                    selectedItems.value.push({
                        id: img.id,
                        name: img.getAttribute('name')
                    });
                }

                element.classList.add('animate__animated', 'animate__flip');

                element.addEventListener('animationend', () => {
                    element.classList.remove('animate__animated', 'animate__flip');
                });

                setTimeout(() => {
                    if (img.classList.contains('hide')) {
                        img.classList.remove('hide');
                    } else {
                        selectedItems.value = selectedItems.value.filter(item => item.id != img.id);
                        img.classList.add('hide');
                    }
                }, 100)
            }

        }

        return {
            prompt,
            name,
            grid,
            grids,
            characters,
            selectedItems,

            validateName,
            getCharacters,
            flipCard,
        }
    }
});

app.use(Quasar, {
    config: {
        brand: {
            primary: '#4acaa8',
            secondary: '#009879',
            accent: '#81fed9',

            dark: '#22272e',

            positive: '#21BA45',
            negative: '#C10015',
            info: '#31CCEC',
            warning: '#F2C037',

        },

        dark: true,


    }
});

app.mount('#q-app');