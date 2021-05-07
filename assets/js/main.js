const {
    createApp,
    onMounted,
    ref,
    reactive,
    watch,
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
        const excludedNames = [];
        let selectedItems = [];
        let timerId = null;

        const prompt = ref(true);
        const confirm = ref(false);
        const name = ref('');
        const grid = ref('8');
        const count = ref(0);
        const time = ref(0.00);
        const characters = ref([]);
        const history = ref([]);
        const bestPlayer = ref(null);


        onMounted(() => {
            const localName = localStorage.getItem('memory-name');
            if (localName) name.value = localName;
        })

        watch(count, (currentValue, oldValue) => {
            if (currentValue == grid.value) {
                clearInterval(timerId);

                let board = localStorage.getItem('memory-board');
                board = JSON.parse(board) || {};

                if (!board[name.value]) board[name.value] = [];
                board[name.value].push(time.value);

                localStorage.setItem('memory-board', JSON.stringify(board));
                history.value = board[name.value].reverse();

                let bestBoardPlayer = null;
                for (const player in board) {
                    const bestTime = board[player].reduce((min, time) => min > time ? time : min);
                    if (!bestBoardPlayer || bestTime < bestBoardPlayer.best_time) {
                        bestBoardPlayer = {
                            player,
                            best_time: bestTime
                        };
                    }
                }
                console.log(bestBoardPlayer);
                bestPlayer.value = bestBoardPlayer;
                confirm.value = true;
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

            localStorage.setItem('memory-name', name.value);

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

        const reloadWindow = () => location.reload();

        return {
            prompt,
            confirm,
            name,
            grid,
            count,
            time,
            grids,
            characters,
            history,
            bestPlayer,

            validateName,
            getCharacters,
            flipCard,
            reloadWindow,
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