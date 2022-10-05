import { ref, computed, reactive, watchEffect, unref } from 'vue'
import moment from 'moment'
import _ from 'lodash'

const { VITE_SEOUL_DATA_APIKEY } = import.meta.env

const api_list = [
    {
        id: 0,
        name: 'TbCorona19CountStatus',
        apikey: VITE_SEOUL_DATA_APIKEY,
        method: 'get',
        category: {
            type: 'timeseries',
            unit: 'day',
        },
        data_path: 'TbCorona19CountStatus.row',

        struct: {
            'seoul.confirmed': { title: '서울 확진자수', src: 'S_HJ' },
            'seoul.death': { title: '서울 사망자수', src: 'S_DEATH' },
            'all.confirmed': { title: '전국 확진자수', src: 'T_HJ' },
            'all.death': { title: '전국 사망자수', src: 'DEATH' }
        },

        n_single_call: 5,
        url: function(apikey, start, end) {
            const today = moment();
            const start_page = today.diff(start, 'days');
            const end_page = today.diff(end, 'days');
        
            return `http://openapi.seoul.go.kr:8088/${apikey}/json/TbCorona19CountStatus/${end_page}/${start_page}`
        },
        timestamp_format: [ 'YYYY.MM.DD.HH', 'YY.MM.DD.HH' ]
    }
]


// apiBuilder


export function useDataloader(apid, list) {
    const Dataloader = class {
        constructor(apid, list) {
            this.apid = apid;
            // this.list = list;
            this.data = list;
            this.data_sorted = ref([]);
            // const self = this;
            // this.kkk = ref([1,5,2]);
            // this.data_sorted = computed(() => { return this.data.value });
            // this.data_sorted = computed(() => [...this.data.value].sort((a,b) => a - b));
            // this.run();
        }
    
        run() {
            this.data.value.push(...this.list.value);
        }
    }

    const dataloader = new Dataloader(apid, list);

    watchEffect(() => {
        dataloader.data.value = [...dataloader.data.value].sort((a,b) => a-b);
    });

    return {
        dataloader,
    }
}