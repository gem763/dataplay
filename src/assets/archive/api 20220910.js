import moment from 'moment'
import _ from 'lodash'
import * as dfd from "danfojs"
import { parsed, parse } from '@/assets/mathparser.js'


// const result = parsed('e*((a*(b+c))+d)');
// const result = parsed('$col("a")-($some()-20)');
// const result = parsed('$col("T_HJ") - $col("S_HJ")');
// const result = parsed('$col("T_HJ") - 1');
// console.log(result);
// console.log(parse('e*((a*(b+c))+d)'))
// console.log(parse('$col("T_HJ") - $col()'))
// const result = parsed('$col("T_HJ") - $col()*5');
// console.log(result);


const { VITE_SEOUL_DATA_APIKEY } = import.meta.env

const apis = [
    {
        id: 0,
        name: '코로나19 확진자 및 사망자수 추이',
        author: 'quantlab',
        created_at: new Date(),
        category: 'timeseries', //spot
        type: 'base', //derivative,
        detail: {
            provider: '서울 열린데이터 광장',
            homepage: 'http://data.seoul.go.kr/dataList/OA-20461/S/1/datasetView.do',
            apikey: VITE_SEOUL_DATA_APIKEY,
            method: 'get',
            n_limit: 5,
            timestamp_format: [ 'YYYY.MM.DD.HH', 'YY.MM.DD.HH' ],
            data_path: 'TbCorona19CountStatus.row',
            url: 'http://openapi.seoul.go.kr:8088/{$apikey}/json/TbCorona19CountStatus/{$index_from_today(end)+1}/{$index_from_today(start)+1}',
            timestamp_path: 'S_DT',
            cols: [
                // 데이터 위치 path: a.b.c
                { name: 'S_HJ', path: 'S_HJ', title: '서울 확진자수', desc: '서울 확진자수 설명' },
                { name: 'S_DEATH', path: 'S_DEATH', title: '서울 사망자수', desc: '서울 사망자수 설명' },
                { name: 'T_HJ', path: 'T_HJ', title: '전국 확진자수', desc: '전국 확진자수 설명' },
                { name: 'DEATH', path: 'DEATH', title: '전국 사망자수', desc: '전국 사망자수 설명' },
                { name: '0_quantlab_0', formula: '$col("T_HJ")-$col("S_HJ")', title: '지방 확진자수', desc: '지방 확진자수 설명' },
                { name: '0_quantlab_1', formula: '$col("DEATH")-$col("S_DEATH")', title: '지방 사망자수', desc: '지방 사망자수 설명' }
            ],
            // cols: {
            //     // key는 데이터 위치 path: a.b.c
            //     'S_HJ': { name: '서울 확진자수', desc: '서울 확진자수 설명' },
            //     'S_DEATH': { name: '서울 사망자수', desc: '서울 사망자수 설명' },
            //     'T_HJ': { name: '전국 확진자수', desc: '전국 확진자수 설명' },
            //     'DEATH': { name: '전국 사망자수', desc: '전국 사망자수 설명' },
            //     '0_quantlab_0': { name: '지방 확진자수', desc: '지방 확진자수 설명', formula: '$col("T_HJ")-$col("S_HJ")' },
            //     '0_quantlab_1': { name: '지방 사망자수', desc: '지방 사망자수 설명', formula: '$col("DEATH")-$col("S_DEATH")' }
            // }
        }
    },
    {
        id: 1,
        name: '코로나19 통계추이',
        author: 'quantlab',
        created_at: new Date(),
        category: 'timeseries',
        type: 'derivative',
        detail: {
            baseid: 0
        }
    }
]


// class Data {
//     constructor(api) {
//         this.api = api;
//         this.raw = null;
//         this.df = null;
//     }

//     set(raw) {
//         this.raw = raw;
//         this.df = new dfd.DataFrame(raw);
//         this.add_custom_cols();
//     }

//     add_custom_cols() {
//         const cols_custom = this.api.detail.cols.filter(o => o.formula);
        
//         cols_custom.forEach(col => {
//             const _formula = parsed(col.formula).replaceAll('$', 'this.');
//             this.add_col(col.name, eval(_formula), { inplace: true });
//         })
//     }

//     col(colname) {
//         return this.df[colname]
//     }

//     add_col(...args) {
//         return this.df.addColumn(...args)
//     }
// }


class Dataframe {
    constructor(df) {
        this.df = df;
    }   
}

class Series {
    constructor(series) {
        this.series = series;
    }
}


class Dataloader {
    constructor(api, p) {
        this.api = api;
        this.p = p;
        this.data = null;
        
        // this.data = new Data(api);
        
        // this.data = [];
        // this.df = null;
    }

    static build(apid, p) {
        const api = apis.find(o => o.id == apid);

        if (api) {
            // const api_cols = api.detail.cols.map(col => col.name);
            // const has_cols = p.cols.every(col => api_cols.includes(col));

            // if (!has_cols) {
            //     throw new Error('cols not available');    
            // }

            if (api.category == 'timeseries' && api.type == 'base') {
                return new DataloaderTimeseriesBase(api, p)
            
            } else if (api.category == 'timeseries' && api.type == 'derivative') {
                return new DataloaderTimeseries(api, p)
            }

        } else {
            throw new Error('cannot find api');    
        }
    }

    load() {
        throw new Error('run() method must be implemented');    
    }

    col(colname) {
        return this.data[colname]
    }
}


class DataloaderTimeseries extends Dataloader {
    constructor(api, p) {
        super(api, p);
        this.loader = Dataloader.build(api.detail.baseid, p);
    }

    async load() {
        await this.loader.load();
        this.data = this.loader.data;
    }
}


class DataloaderTimeseriesBase extends Dataloader {
    constructor(api, p) {
        super(api, p);
        this.today = moment();
        this.date_chunks = this._split_dates(p.start, p.end);
        // this.cols = this._cols_classified;
        this.cols_origin = this.api.detail.cols.filter(o => o.path);
        this.resp = {};
    }

    // get _cols_classified() {
    //     const _cols = {
    //         origin: [],
    //         custom: []
    //     };

    //     this.p.cols.forEach(col => {
    //         if (this.api.detail.cols[col].formula) {
    //             _cols.custom.push(col);

    //         } else {
    //             _cols.origin.push(col);
    //         }
    //     });

    //     return _cols
    // }

    index_from_today(dt) {
        return this.today.diff(dt, 'days')
    }

    get apikey() {
        return this.api.detail.apikey
    }

    _split_dates(start, end) {
        const _chunks = [];

        if (this.api.detail.n_limit) {
            let date_0 = moment(start);
            let date_1 = moment(end);
            
            const diff = date_1.diff(date_0, 'days') + 1;
        
            if (diff > this.api.detail.n_limit) {
                date_0 = date_1.add(-this.api.detail.n_limit + 1, 'days');
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
        if (Array.isArray(this.api.detail.timestamp_format)) {
            let _timestamp;
    
            for (let fmt of this.api.detail.timestamp_format) {
                if (fmt.length == dt.length) {
                    _timestamp = moment(dt, fmt).toDate()
                    break
                }
            }
    
            return _timestamp
    
        } else {
            return moment(dt, this.api.detail.timestamp_format).toDate()
        }
    }

    _timeseries_adapter(o) {
        const obj = { 
            timestamp: this._parse_timestamp(_.get(o, this.api.detail.timestamp_path)) 
        };

        this.cols_origin.forEach(col => {
            obj[col.name] = _.get(o, col.path) * 1;
        })

        return obj
    }

    _url(start, end) {
        const url_split = this.api.detail.url
            .replaceAll('$', 'this.')
            .split(/\{|\}/g)
            .map(o => {
                if (o.includes('this.')) {
                    return eval(o)
                } else {
                    return o
                }
            });
        
        return url_split.join('')
    }


    add_custom_cols() {
        const cols_custom = this.api.detail.cols.filter(o => o.formula);
        
        cols_custom.forEach(col => {
            const _formula = parsed(col.formula).replaceAll('$', 'this.');
            this.data.addColumn(col.name, eval(_formula), { inplace: true });
        })
    }

    async load() {
        let d = [];

        await Promise.all(this.date_chunks.map(async ([start, end]) => {
            const url = this._url(start, end);
            const resp = await fetch(url);
            const x = await resp.json();
            const _data = _.get(x, this.api.detail.data_path).map(this._timeseries_adapter.bind(this));
            d.push(..._data);
            this.resp[url] = x;
        }));

        d = d
            .filter(o => {
                return o.timestamp >= moment(this.p.start) 
                    && o.timestamp <= moment(this.p.end)
            })
            .sort((a,b) => a.timestamp - b.timestamp);

        // this.data.set(d);


        this.data = new dfd.DataFrame(d);
        this.add_custom_cols();
        // this.df.print();
        // const js = dfd.toJSON(df);
        // console.log(js)
    }
}

export {
    Dataloader
    // Apibuilder
}