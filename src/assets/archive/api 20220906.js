import moment from 'moment'
import _ from 'lodash'
import * as dfd from "danfojs"


const { VITE_SEOUL_DATA_APIKEY } = import.meta.env

const apis = [
    {
        id: 0,
        name: 'TbCorona19CountStatus',
        author: 'quantlab',
        provider: '서울 열린데이터 광장',
        homepage: 'http://data.seoul.go.kr/dataList/OA-20461/S/1/datasetView.do',
        apikey: VITE_SEOUL_DATA_APIKEY,
        method: 'get',
        category: {
            type: 'timeseries',
            unit: 'day',
        },
        data_path: 'TbCorona19CountStatus.row',
        n_limit: 5,
        timestamp_format: [ 'YYYY.MM.DD.HH', 'YY.MM.DD.HH' ],
        url: function(start, end) {
            return `http://openapi.seoul.go.kr:8088/${this.api.apikey}/json/TbCorona19CountStatus/${this.index_from_today(end)+1}/${this.index_from_today(start)+1}`
        },
        fields: {
            // key는 데이터 위치 path: a.b.c
            'S_HJ': { name: '서울 확진자수', desc: '서울 확진자수 설명' },
            'S_DEATH': { name: '서울 사망자수', desc: '서울 사망자수 설명' },
            'T_HJ': { name: '전국 확진자수', desc: '전국 확진자수 설명' },
            'DEATH': { name: '전국 사망자수', desc: '전국 사망자수 설명' },
        }
    }
]

class Apibuilder {}

class Dataloader {
    constructor(apid, start, end, flds) {
        this.today = moment();
        this.apid = apid;
        this.start = start;
        this.end = end;
        this.flds = flds;
        this.api = apis.filter(o => o.id == apid)[0];
        this.date_chunks = this._split_dates(start, end);
        this.data = [];
        this.resp = [];
    }

    index_from_today(dt) {
        return this.today.diff(dt, 'days')
    }

    _split_dates(start, end) {
        const _chunks = [];

        if (this.api.n_limit) {
            let date_0 = moment(start);
            let date_1 = moment(end);
            
            const diff = date_1.diff(date_0, 'days') + 1;
        
            if (diff > this.api.n_limit) {
                date_0 = date_1.add(-this.api.n_limit + 1, 'days');
                _chunks.push([date_0.format('YYYY-MM-DD'), end]);
        
                let date_1_prev = date_0.add(-1, 'days').format('YYYY-MM-DD');
                _chunks.push(...this._split_dates(start, date_1_prev));
        
            } else {
                _chunks.push([start, end]);
            }
    
        } else {
            _chunks.push([start, end]);
        }

        return _chunks
    }

    _parse_timestamp(dt) {
        if (Array.isArray(this.api.timestamp_format)) {
            let _timestamp;
    
            for (let fmt of this.api.timestamp_format) {
                if (fmt.length == dt.length) {
                    _timestamp = moment(dt, fmt).toDate()
                    break
                }
            }
    
            return _timestamp
    
        } else {
            return moment(dt, this.api.timestamp_format).toDate()
        }
    }

    _timeseries_adapter(o) {
        const obj = { timestamp: this._parse_timestamp(o.S_DT) };

        this.flds.forEach(f => {
            obj[f] = _.get(o, f) * 1;
            // obj[f] = _.get(o, this.api.fields[f].path) * 1;
        })

        return obj
    }

    async run() {
        const data = [];

        await Promise.all(this.date_chunks.map(async ([start, end]) => {
            const url = this.api.url.bind(this)(start, end);
            const resp = await fetch(url);
            const x = await resp.json();
            const _data = _.get(x, this.api.data_path).map(this._timeseries_adapter.bind(this));
            data.push(..._data);
            this.resp.push(x);
        }));

        this.data = data.sort((a,b) => a.timestamp - b.timestamp);
        // this.data = data;
        const df = new dfd.DataFrame(this.data);
        df.print();
        // const js = dfd.toJSON(df);
        // console.log(js)
    }
}

export {
    Dataloader,
    Apibuilder
}