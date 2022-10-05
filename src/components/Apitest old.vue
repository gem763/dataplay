<script setup>
import { ref, computed } from 'vue'
import { UserApi } from '@/assets/api.js'
// import { useFetcher } from '@/assets/fetcher.js'
import { useDataloader } from '@/assets/dataloader.js'

/*
user inputs
*/
// const api_id = ref(0);
// const start_date = ref('2022-08-01');
// const end_date = ref('2022-09-02');
const apid = ref(0);
const list = ref([1,3,2]);

const { dataloader } = useDataloader(apid, list);

// const { start, api, date_chunks, data_sorted, get } = useFetcher(api_id, start_date, end_date);

// const run = () => {
//     get();
// }
</script>

<template>
    <button @click="run">RUN</button>
</template>

<style scoped>
</style>
    