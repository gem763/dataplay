import moment from 'moment'
import _ from 'lodash'
import * as dfd from "danfojs"
var Lexer = require("lex");
// import overload from 'operator-overloading';


// console.log(Lexer);

var lexer = new Lexer;

lexer.addRule(/\s+/, function () {
    /* skip whitespace */
});

lexer.addRule(/[a-z]/, function (lexeme) {
    return lexeme; // symbols
});

lexer.addRule(/[\(\+\-\*\/\)]/, function (lexeme) {
    return lexeme; // punctuation (i.e. "(", "+", "-", "*", "/", ")")
});

var factor = {
    precedence: 2,
    associativity: "left"
};

var term = {
    precedence: 1,
    associativity: "left"
};

function Parser(table) {
    this.table = table;
}

Parser.prototype.parse = function (input) {
    var length = input.length,
        table = this.table,
        output = [],
        stack = [],
        index = 0;

    while (index < length) {
        var token = input[index++];

        switch (token) {
        case "(":
            stack.unshift(token);
            break;
        case ")":
            while (stack.length) {
                var token = stack.shift();
                if (token === "(") break;
                else output.push(token);
            }

            if (token !== "(")
                throw new Error("Mismatched parentheses.");
            break;
        default:
            if (table.hasOwnProperty(token)) {
                while (stack.length) {
                    var punctuator = stack[0];

                    if (punctuator === "(") break;

                    var operator = table[token],
                        precedence = operator.precedence,
                        antecedence = table[punctuator].precedence;

                    if (precedence > antecedence ||
                        precedence === antecedence &&
                        operator.associativity === "right") break;
                    else output.push(stack.shift());
                }

                stack.unshift(token);
            } else output.push(token);
        }
    }

    while (stack.length) {
        var token = stack.shift();
        if (token !== "(") output.push(token);
        else throw new Error("Mismatched parentheses.");
    }

    return output;
};

var parser = new Parser({
    "+": term,
    "-": term,
    "*": factor,
    "/": factor
});

function parse(input) {
    lexer.setInput(input);
    var tokens = [], token;
    while (token = lexer.lex()) tokens.push(token);
    return parser.parse(tokens);
}

// var output = parse("e*((a*(b+c))+d)");
// console.log(output); 

var stack = [];

var operator = {
    "+": "add",
    "-": "sub",
    "*": "mul",
    "/": "div"
};

parse("e*((a*(b+c))+d)").forEach(function (c) {
    switch (c) {
    case "+":
    case "-":
    case "*":
    case "/":
        var b = stack.pop();
        var a = stack.pop();
        stack.push(`${a}.${operator[c]}(${b})`);
        // stack.push(operator[c] + "(" + a + ", " + b + ")");
        break;
    default:
        stack.push(c);
    }
});

var output = stack.pop();

console.log(output);
// console.log(stack);


// function Test(name) {
//     this.name = name;

//     this.__plus = function(left) {
//         return new Test(left.name + '+' + this.name)
//     }
// }

// // let sjk = new Test('sjk');
// // let quantlab = new Test('quantlab');

// // const str = 'sjk';

// overload(function (Test) {
//     let sjk = new Test('sjk');
//     let quantlab = new Test('quantlab');
    
//     let fn = new Function('a', 'b', 'return a + b');
//     let result = fn(sjk, quantlab);
//     console.log(result);
// })(Test);


const { VITE_SEOUL_DATA_APIKEY } = import.meta.env

const apis = [
    {
        id: 0,
        name: '코로나19 확진자 및 사망자수 추이',
        author: 'quantlab',
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
            // url: function(start, end) {
                // return `http://openapi.seoul.go.kr:8088/${this.apikey}/json/TbCorona19CountStatus/${this.index_from_today(end)+1}/${this.index_from_today(start)+1}`
            //     // return `http://openapi.seoul.go.kr:8088/${this.api.detail.apikey}/json/TbCorona19CountStatus/${this.index_from_today(end)+1}/${this.index_from_today(start)+1}`
            // },
            url: 'http://openapi.seoul.go.kr:8088/{$apikey}/json/TbCorona19CountStatus/{$index_from_today(end)+1}/{$index_from_today(start)+1}',
            fields: {
                // key는 데이터 위치 path: a.b.c
                'S_HJ': { name: '서울 확진자수', desc: '서울 확진자수 설명' },
                'S_DEATH': { name: '서울 사망자수', desc: '서울 사망자수 설명' },
                'T_HJ': { name: '전국 확진자수', desc: '전국 확진자수 설명' },
                'DEATH': { name: '전국 사망자수', desc: '전국 사망자수 설명' },
            }
        }
    },
    {
        id: 1,
        name: '코로나19 통계추이',
        author: 'quantlab',
        category: 'timeseries',
        type: 'derivative',
        detail: {
            baseid: 0
        }
    }
]


class Dataloader {
    constructor(api, p) {
        this.api = api;
        this.p = p;
        this.data = [];
    }

    static build(apid, p) {
        // const api = apis.filter(o => o.id == apid)[0];
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

    run() {
        throw new Error('run() method must be implemented');    
    }
}


class DataloaderTimeseries extends Dataloader {
    constructor(api, p) {
        super(api, p);
        this.loader = Dataloader.build(api.detail.baseid, p);
    }

    async run() {
        await this.loader.run();
        this.data = this.loader.data;
    }
}


class DataloaderTimeseriesBase extends Dataloader {
    constructor(api, p) {
        super(api, p);
        this.today = moment();
        this.date_chunks = this._split_dates(p.start, p.end);
        this.resp = [];
    }

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
        const obj = { timestamp: this._parse_timestamp(o.S_DT) };

        this.p.flds.forEach(f => {
            obj[f] = _.get(o, f) * 1;
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

    async run() {
        const data = [];

        await Promise.all(this.date_chunks.map(async ([start, end]) => {
            // const url = this.api.detail.url.bind(this)(start, end);
            const url = this._url(start, end);
            const resp = await fetch(url);
            const x = await resp.json();
            const _data = _.get(x, this.api.detail.data_path).map(this._timeseries_adapter.bind(this));
            data.push(..._data);
            this.resp.push(x);
        }));

        this.data = data
            .filter(o => {
                return o.timestamp >= moment(this.p.start) && o.timestamp <= moment(this.p.end)
            })
            .sort((a,b) => a.timestamp - b.timestamp);
        // const df = new dfd.DataFrame(this.data);
        // df.print();
        // const js = dfd.toJSON(df);
        // console.log(js)
    }
}

export {
    Dataloader,
    // DataloaderTimeseriesBase,
    // Apibuilder
}