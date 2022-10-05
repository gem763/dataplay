<script setup>
import { ref, computed, reactive } from 'vue'
import { apis, Loader, TimeseriesBaseloader } from '@/assets/api.js'

/*
user inputs
*/
const apid = ref(2);
const start_date = ref('2022-09-20');
const end_date = ref('2022-09-25');
const file = ref('json');
// const cols = ref([
//     { name: 'custom1', formula: '$col("0_quantlab_1")*2' },
//     { name: 'custom2', formula: '$col("S_HJ")*0 + $col("DEATH").sum()' },
// ]);

// const specs = {
//     0: { start: start_date.value, end: end_date.value },
//     1: { start: start_date.value, end: end_date.value }
// }

// const specs = new Map([
//     [0, { start: start_date, end: end_date }],
//     [1, { start: start_date, end: end_date }],
// ])

// const multiloader = new Multiloader(specs);

const loader = ref(null);
// const data = ref(null);

// const load = () => {
//     const api = apis[0].src[0];

//     loader.value = new TimeseriesBaseloader(api, {
//         start: start_date.value,
//         end: end_date.value,
//     });

//     loader.value.load();
// }


const api = apis.find(o => o.id == apid.value);

loader.value = Loader.build(api, {
    start: start_date.value,
    end: end_date.value,
    filetype: file.value,
});

const load = async () => {
    // const api = apis.find(o => o.id == apid.value);

    // loader.value = Loader.build(api, {
    //     start: start_date.value,
    //     end: end_date.value,
    // });

    await loader.value.load();
}

const get = () => {
    // loader.value.get(cols.value);
}
</script>

<template>
    <button @click="load">LOAD</button>
    <button @click="get">GET</button>
</template>

<style scoped>
</style>
    