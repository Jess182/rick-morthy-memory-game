const {
    createApp,
    ref,
    reactive,
    watch
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
        let selectedItems = [];
        const excludedNames = [];
        let timerId = null;

        const prompt = ref(true);
        const name = ref('');
        const grid = ref('8');
        const count = ref(0);
        const time = ref(0.00);
        const characters = ref([]);


        watch(count, (currentValue, oldValue) => {
            if (currentValue == grid.value) {
                clearInterval(timerId);
            }
        });

        const validateName = value => {
            if (!value && name.value.trim().length == 0) prompt.value = true;
        };


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
                .sort(() => .5 - Math.random());

            timerId = setInterval(() => time.value++, 1000)
        };

        const flipCard = event => {
            const element = event.target;
            const img = element.closest('.img');
            const imgName = img.getAttribute('name');

            // Disable flip for finded characters
            if (excludedNames.includes(imgName)) return false;

            // Flip same card or max 2
            if (selectedItems.length < 2 || selectedItems.find(item => item.id == img.id)) {
                // If current is not selected
                if (!selectedItems.find(item => item.id == img.id)) {
                    // If current is equal to first selected item
                    if (selectedItems.find(item => item.name == imgName)) {
                        excludedNames.push(imgName);
                        count.value++;
                        selectedItems = [];
                    } else {
                        selectedItems.push({
                            id: img.id,
                            name: imgName
                        });
                    }
                }

                element.classList.add('animate__animated', 'animate__flip');
                element.addEventListener('animationend', () => {
                    element.classList.remove('animate__animated', 'animate__flip');
                });

                setTimeout(() => {
                    if (img.classList.contains('hide')) {
                        img.classList.remove('hide');
                    } else {
                        selectedItems = selectedItems.filter(item => item.id != img.id);
                        img.classList.add('hide');
                    }
                }, 100)
            }

        }

        return {
            prompt,
            name,
            grid,
            count,
            time,
            grids,
            characters,

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