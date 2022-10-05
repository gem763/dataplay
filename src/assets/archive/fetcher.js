import { ref, computed, watchEffect, unref } from 'vue'
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


export function useFetcher(_api_id, _start, _end) {
    const api_id = ref(_api_id);
    const start = ref(_start);
    const end = ref(_end);

    const api = computed(() => api_list.filter(o => o.id == api_id.value)[0]);
    const data = ref([]);
    const data_sorted = computed(() => data.value.sort((a,b) => a.timestamp - b.timestamp));
    // const date_chunks = ref([]);

    // watchEffect(() => {
    //     api_id
    // });

    // console.log(api.value)

    const _split_dates = (start, end) => {
        const _chunks = [];
        let date_0 = moment(start);
        let date_1 = moment(end);
        
        const diff = date_1.diff(date_0, 'days');
    
        if (diff > api.value.n_single_call) {
            date_0 = date_1.add(-api.value.n_single_call, 'days');
            _chunks.push([date_0.format('YYYY-MM-DD'), end]);
    
            let date_1_prev = date_0.add(-1, 'days').format('YYYY-MM-DD');
            _chunks.push(..._split_dates(start, date_1_prev));
    
        } else {
            _chunks.push([start, end]);
        }
    
        return _chunks
    };

    const _parse_timestamp = (dt) => {
        if (Array.isArray(api.timestamp_format)) {
            let _timestamp;
    
            for (let fmt of api.timestamp_format) {
                if (fmt.length == dt.length) {
                    _timestamp = moment(dt, fmt).toDate()
                    break
                }
            }
    
            return _timestamp
    
        } else {
            return moment(dt, api.timestamp_format).toDate()
        }
    }

    const _timeseries_adapter = (o) => {
        const struct = api.struct;
        const obj = { timestamp: _parse_timestamp(o.S_DT) };

        for (let key in struct) {
            _.set(obj, key, o[struct[key].src] * 1);
        }

        return obj
    }

    const get = () => {
        date_chunks.value.forEach(([start, end]) => {
            fetch(api.url(api.apikey, start, end))
                .then(x => x.json())
                .then(x => {
                    try {
                        const _data = _.get(x, api.data_path).map(_timeseries_adapter);
                        data.value.push(..._data);
    
                    } catch(e) {
                        console.log(e);
                    }
                });
        });
    }

    // date_chunks.value = _split_dates(start_date, end_date);
    // const date_chunks = [];// = _split_dates(start_date.value, end_date.value);
    const date_chunks = computed(() => { _split_dates(_start.value, _end.value); });
    // run();

    return {
        start,
        api,
        date_chunks,
        data_sorted,
        get
    }
}