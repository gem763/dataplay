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

// let arr = [[12, 34, 2.2, 2], [30, 30, 2.1, 7]];
// let df = new dfd.DataFrame(arr, {columns: ["A", "B", "C", "D"]});
// let df = new dfd.Series([1,2,3,4]);
// console.log(df.constructor.name);
// console.log(1234)
// console.log(moment('2022-09-09').add(1, 'days'));

const { VITE_SEOUL_DATA_APIKEY } = import.meta.env

const apis = [
    {
        id: 0,
        name: '코로나 확진자 및 사망자 발생동향 (전국/서울)',
        author: 'quantlab',
        created_at: new Date(),
        category: 'timeseries', //spot
        type: 'base', //derivative,
        detail: {
            provider: '서울 열린데이터 광장',
            homepage: 'http://data.seoul.go.kr/dataList/OA-20461/S/1/datasetView.do',
            apikey: VITE_SEOUL_DATA_APIKEY,
            method: 'get',
            n_limit: 1000,
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
                { name: '0_quantlab_1', formula: '$col("DEATH")-$col("S_DEATH")', title: '지방 사망자수', desc: '지방 사망자수 설명' },
            ]
        }
    },
    {
        id: 1,
        name: '코로나 확진자 발생동향 (서울 자치구별)',
        author: 'quantlab',
        created_at: new Date(),
        category: 'timeseries', //spot
        type: 'base', //derivative,
        detail: {
            provider: '서울 열린데이터 광장',
            homepage: 'http://data.seoul.go.kr/dataList/OA-20470/S/1/datasetView.do',
            apikey: VITE_SEOUL_DATA_APIKEY,
            method: 'get',
            n_limit: 5,
            timestamp_format: [ 'YYYY.MM.DD.HH', 'YY.MM.DD.HH' ],
            data_path: 'TbCorona19CountStatusJCG.row',
            url: 'http://openapi.seoul.go.kr:8088/{$apikey}/json/TbCorona19CountStatusJCG/{$index_from_today(end)+1}/{$index_from_today(start)+1}',
            timestamp_path: 'JCG_DT',
            cols: [
                { name: 'JONGNO', path: 'JONGNO', title: '종로구' },
                { name: 'JUNGGU', path: 'JUNGGU', title: '중구' },
                { name: 'YONGSAN', path: 'YONGSAN', title: '용산구' },
                { name: 'SEONGDONG', path: 'SEONGDONG', title: '성동구' },
                { name: 'GWANGJIN', path: 'GWANGJIN', title: '광진구' },
                { name: 'DDM', path: 'DDM', title: '동대문구' },
                { name: 'JUNGNANG', path: 'JUNGNANG', title: '중랑구' },
                { name: 'SEONGBUK', path: 'SEONGBUK', title: '성북구' },
                { name: 'GANGBUK', path: 'GANGBUK', title: '강북구' },
                { name: 'DOBONG', path: 'DOBONG', title: '도봉구' },
                { name: 'NOWON', path: 'NOWON', title: '노원구' },
                { name: 'EP', path: 'EP', title: '은평구' },
                { name: 'SDM', path: 'SDM', title: '서대문구' },
                { name: 'MAPO', path: 'MAPO', title: '마포구' },
                { name: 'YANGCHEON', path: 'YANGCHEON', title: '양천구' },
                { name: 'GANGSEO', path: 'GANGSEO', title: '강서구' },
                { name: 'GURO', path: 'GURO', title: '구로구' },
                { name: 'GEUMCHEON', path: 'GEUMCHEON', title: '금천구' },
                { name: 'YDP', path: 'YDP', title: '영등포구' },
                { name: 'DONGJAK', path: 'DONGJAK', title: '동작구' },
                { name: 'GWANAK', path: 'GWANAK', title: '관악구' },
                { name: 'SEOCHO', path: 'SEOCHO', title: '서초구' },
                { name: 'GANGNAM', path: 'GANGNAM', title: '강남구' },
                { name: 'SONGPA', path: 'SONGPA', title: '송파구' },
                { name: 'GANGDONG', path: 'GANGDONG', title: '강동구' },
                { name: 'ETC', path: 'ETC', title: '기타' },
            ]
        }
    },
    {
        id: 2,
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


class DanfoBase {
    constructor(data) {
        this.obj = this.init_obj(data);
    }

    init_obj(data) {
        let obj_type = this.obj_type;

        if (data.constructor.name.includes(obj_type)) {
            return data
        } else {
            return new dfd[obj_type](data)
        }
    }

    get type() {
        return this.constructor.name
    }

    get obj_type() {
        if (this.type == 'Table') {
            return 'DataFrame'

        } else if (this.type == 'Column') {
            return 'Series'
        }
    }

    r(right) {
        // return (typeof right == 'number') ? right : right.obj
        return right.obj ? right.obj : right
    }

    add(right) {
        return new this.constructor(this.obj.add(this.r(right)))
    }

    sub(right) {
        return new this.constructor(this.obj.sub(this.r(right)))
    }

    mul(right) {
        return new this.constructor(this.obj.mul(this.r(right)))
    }

    div(right) {
        return new this.constructor(this.obj.div(this.r(right)))
    }
}


class Column extends DanfoBase {
    constructor(data) {
        super(data);
    }

    // init_obj(data) {
    //     try {
    //         if (data.constructor.name.toLowerCase().includes('series')) {
    //             return data
    //         } else {
    //             return new dfd.Series(data)
    //         }

    //     } catch(e) {
    //         throw new Error(`something wrong while creating column object from ${data}`);
    //     }
    // }

    sum() {
        // console.log(this.obj.sum())
        return this.obj.sum()
    }
}

class Table extends DanfoBase {
    constructor(data) {
        super(data);
        this.cols_added = [];
        this.view = null;
    }

    // init_obj(data) {
    //     try {
    //         if (data.constructor.name.toLowerCase().includes('dataframe')) {
    //             return data
    //         } else {
    //             return new dfd.DataFrame(data)
    //         }

    //     } catch(e) {
    //         throw new Error(`something wrong while creating table object from ${data}`);
    //     }
    // }

    add_custom_col(name, formula) {
        try {
            const _formula = parsed(formula).replaceAll('$', 'this.');
            this.obj.addColumn(name, eval(_formula).obj, { inplace: true });

            this.cols_added.push({
                name: name,
                formula: formula,
                formula_parsed: _formula
            });

        } catch(e) {
            throw new Error(`something wrong while adding column [${name}]: ${formula}`);
        }
    }

    add_custom_cols(cols) {
        cols.forEach(col => {
            this.add_custom_col(col.name, col.formula);
        })
    }

    col(name) {
        return new Column(this.obj[name])
    }
}



class Dataloader {
    constructor(api, p) {
        this.api = api;
        this.p = p;
        this.table = null;
    }

    static build(apid, p) {
        const api = apis.find(o => o.id == apid);

        if (api) {
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

    get(cols) {
        this.table.add_custom_cols(cols);
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
        this.date_chunks = this._date_chunks();
        this.cols_origin = this.api.detail.cols.filter(o => o.path);
        this.resp = {};
    }

    index_from_today(dt) {
        return this.today.diff(dt, 'days')
    }

    get apikey() {
        return this.api.detail.apikey
    }

    _date_chunks() {
        const start = moment(this.p.start);
        const end = moment(this.p.end).add(1, 'days');
        return this._split_dates(start, end)
    }

    _split_dates(start, end) {
        const _chunks = [];

        if (this.api.detail.n_limit) {
            const diff = end.diff(start, 'days') + 1;
        
            if (diff > this.api.detail.n_limit) {
                const start_0 = end.clone().add(-this.api.detail.n_limit + 1, 'days');
                _chunks.push([start_0, end]);
        
                const end_1 = start_0.clone().add(-1, 'days');
                _chunks.push(...this._split_dates(start, end_1));
        
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

        d = d.filter(o => {
                return o.timestamp >= moment(this.p.start) && o.timestamp <= moment(this.p.end)
            }).sort((a,b) => a.timestamp - b.timestamp);

        const cols_custom = this.api.detail.cols.filter(o => o.formula);
        this.table = new Table(d);
        this.table.add_custom_cols(cols_custom);
        // this.table.obj.print()
    }
}

export {
    Dataloader
    // Apibuilder
}