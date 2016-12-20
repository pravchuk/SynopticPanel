/*
 * OKViz Utilities
 * v1.2.0
*/

namespace powerbi.visuals { export let valueFormatter: any; }

module powerbi.extensibility.visual.PBI_CV_815282F9_27F5_4950_9430_E910E0A8DB6A  {

    export module OKVizUtility {

         export class Formatter {
            
            private static _instance:Formatter = new Formatter();
            private _cachedFormatters: any = {};

            constructor() {

                Globalize = (<any>window).Globalize;

                if(Formatter._instance){
                    console.log("Error: use Formatter.getInstance() instead of new.");
                    return;
                }
                Formatter._instance = this;
            }

            public static getInstance(): Formatter{
                return Formatter._instance;
            }

            public static getFormatter(properties: any) {

                let singleton = Formatter._instance;

                let key = JSON.stringify(properties);
                let pbiFormatter: any;
                if (key in singleton._cachedFormatters) {
                    pbiFormatter = singleton._cachedFormatters[key];
                } else {
                    pbiFormatter = powerbi.visuals.valueFormatter.create(properties);
                    singleton._cachedFormatters[key] = pbiFormatter;
                }
                return pbiFormatter;
            }

            public static format(value, properties) {
                
                let formatter: any = Formatter.getFormatter(properties);
                return formatter.format(value);
            }

            public static getAxisDatesFormatter(dateFrom, dateTo?) {

                let dateDiff = dateFrom;
                if (dateTo) {
                    if (dateFrom > dateTo) {
                        let tmpDate = dateFrom;
                        dateFrom = dateTo;
                        dateTo = tmpDate;
                    }
                    dateDiff = (dateTo - dateFrom);
                }
                let seconds = dateDiff / 1000;
                let minutes = seconds / 60;
                let hours = minutes / 60;
                let days = hours / 24;
                let months = days / 31;
                let years = days / 365;

                let format = '%x';
                if (Math.floor(years) > 0) {
                    format = '%Y';
                } else if (Math.floor(months) > 1) {
                    format = '%b %Y';
                } else if (Math.floor(days) > 0) {
                    format = '%b %e';
                } else if (Math.floor(hours) > 6) {
                    format = '%I:00 %p';
                } else if (Math.floor(minutes) > 0) {
                    format = '%I:%M %p';
                }

                return d3.time.format(format);
            }

        }


        //Need capability:  "t": { "properties": { "u": { "type": { "text": true } } } }
        export function t(visual: string[], element: any, options: VisualUpdateOptions, host: IVisualHost, features?: any) {
                
            if (!options || !options.dataViews || !options.dataViews[0] || !options.dataViews[0].metadata || !options.dataViews[0].metadata.objects) return;

            if (options.type !== VisualUpdateType.Data && options.type !== VisualUpdateType.ViewMode && options.type !== VisualUpdateType.All) return;

            let persistU = false
            let u = getValue<string>(options.dataViews[0].metadata.objects, "t", "u", null);
            if (!u) {
                u = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                    return v.toString(16);
                });
                persistU = true;            
            }

            let lang = navigator.language || (<any>navigator).userLanguage;
            let cli = (window.location ? (window.location.host == 'app.powerbi.com' ? 'app.powerbi.com' : 'localhost') : ''); 

            let cd = '';
            if (features) {
                for (let key in features)
                    cd += '&' + key + '=' + features[key];
            }

            let url = 'https://www.google-analytics.com/collect?v=1&t=screenview&tid=UA-7095697-25&cid=' + u + '&an=' + visual[0] + '&av=' + visual[1] + '&ul=' + lang + '&cd=' + cli + cd;

            let sc = '';

            let el = (element instanceof d3.selection ? element : d3.select(element instanceof jQuery ? element[0] : element));
            let t = el.select('img.okty');
            if (t.empty()) {
                t = el.append('img')
                    .classed('okty', true)
                    .style({'width': 0, 'height': 0, 'position': 'absolute', 'visibility' : 'hidden' });
                sc = '&sc=start';
            }

            t.attr('src', url + sc + '&nocache=' + new Date().getTime());

            if (persistU) {
                host.persistProperties({
                    merge: [{
                        objectName: 't',
                        selector: null,
                        properties: { 'u': u },
                    }]
                });
            }  
        }

        export function normalizeHex(hex) {
            if (hex.substring(0, 1) !== "#")
                hex = '#' + hex;
            if (hex.length == 4)
                hex += hex.substr(1,3);
            return hex; 
        }

        export function hexToRGB(hex) {
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizeHex(hex));
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : hex;
        }

        export function RGBToHex(rgb) {
            return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
        }

        export function saturateColor(hex, percent, baseColor?) {

            if (baseColor) {    
                //Pretty saturation
                let RGB = hexToRGB(hex);
                let baseRGB = hexToRGB(baseColor);

                let returnRGB = {
                    r: Math.round(baseRGB.r + ((RGB.r - baseRGB.r) * percent)),
                    g: Math.round(baseRGB.g + ((RGB.g - baseRGB.g) * percent)),
                    b: Math.round(baseRGB.b + ((RGB.b - baseRGB.b) * percent))
                }
                return RGBToHex(returnRGB);
                
            } else {
                //Real saturation
                let HSL = HexToHSL(hex);
                HSL.s *= percent;
                return HSLToHex(HSL);
            }
        }

        export function HexToHSL(hex) {
            
            let rgb = hexToRGB(hex);
            let r = rgb.r / 255,
                g = rgb.g / 255,
                b = rgb.b / 255,
                max = Math.max(r, g, b),
                min = Math.min(r, g, b),
                delta = max - min,
                l = (max + min) / 2,
                h = 0,
                s = 0;

            if (delta == 0) 
                h = 0;
            else if (max == r)
                h = 60 * (((g - b) / delta) % 6);
            else if (max == g)
                h = 60 * (((b - r) / delta) + 2);
            else
                h = 60 * (((r - g) / delta) + 4);

            if (delta == 0)
                s = 0;
            else
                s = (delta/(1-Math.abs(2*l - 1)))

            return {
                h: h,
                s: s,
                l: l
            }
        }

        export function HSLToHex(hsl) {
            var h = hsl.h,
                s = hsl.s,
                l = hsl.l,
                c = (1 - Math.abs(2*l - 1)) * s,
                x = c * ( 1 - Math.abs((h / 60 ) % 2 - 1 )),
                m = l - c/ 2,
                r, g, b;

            if (h < 60) {
                r = c;
                g = x;
                b = 0;
            }
            else if (h < 120) {
                r = x;
                g = c;
                b = 0;
            }
            else if (h < 180) {
                r = 0;
                g = c;
                b = x;
            }
            else if (h < 240) {
                r = 0;
                g = x;
                b = c;
            }
            else if (h < 300) {
                r = x;
                g = 0;
                b = c;
            }
            else {
                r = c;
                g = 0;
                b = x;
            }

            let normalizeRGB = function(color, m) {
                color = Math.floor((color + m) * 255);
                if (color < 0) color = 0;
                return color;
            };

            return RGBToHex({
                r: normalizeRGB(r, m),
                g: normalizeRGB(g, m),
                b: normalizeRGB(b, m)
            });
        }

        export function autoTextColor(backColor, normalColor?, invertedColor?): string {

            let rgbColor = hexToRGB(backColor);
            let o = Math.round(((rgbColor.r * 299) + (rgbColor.g * 587) + (rgbColor.b * 114)) / 1000);
            return (o > 125 ? (normalColor ? normalColor : shadeBlend(-0.6, normalizeHex(backColor), null)) : (invertedColor ?  invertedColor : '#ffffff'));
        }

        //http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors - Version 2 Universal
        export function shadeBlend(p, c0, c1) {
            var n = p < 0 ? p * -1 : p, u = Math.round, w = parseInt;
            if (c0.length > 7) {
                var f = c0.split(","), t = (c1 ? c1 : p < 0 ? "rgb(0,0,0)" : "rgb(255,255,255)").split(","), R = w(f[0].slice(4)), G = w(f[1]), B = w(f[2]);
                return "rgb(" + (u((w(t[0].slice(4)) - R) * n) + R) + "," + (u((w(t[1]) - G) * n) + G) + "," + (u((w(t[2]) - B) * n) + B) + ")";
            } else {
                var f1 = w(c0.slice(1), 16), t1 = w((c1 ? c1 : p < 0 ? "#000000" : "#FFFFFF").slice(1), 16), R1 = f1 >> 16, G1 = f1 >> 8 & 0x00FF, B1 = f1 & 0x0000FF;
                return "#" + (0x1000000 + (u(((t1 >> 16) - R1) * n) + R1) * 0x10000 + (u(((t1 >> 8 & 0x00FF) - G1) * n) + G1) * 0x100 + (u(((t1 & 0x0000FF) - B1) * n) + B1)).toString(16).slice(1);
            }
        }

        //Beta
        export function getTextSize(text: string, fontSize:number, rotation?: number): any {
            let $element = $("<text />")
                .text(text)
                .css({
                    "font-size": fontSize + "px",
                    "font-family": "sans-serif"
                });
            
            if (rotation > 0)
                $element.css("transform", "rotate(" + rotation + ")");

            let bbox = $element[0].getBoundingClientRect();
            return { width: bbox.width, height: bbox.height };
        }

        export function isValidURL(URL: string) {

            if (typeof URL === 'undefined' || !URL) return false;
            if (URL.length > 2083) return false;
            if (String(URL).substr(0, 4).toLowerCase() !== 'http') return false; //This solve regex problems with binary strings
            
            var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
            return pattern.test(URL);

        }
        
        export function makeMeasureReadable(value: any) {
            
            if (value === undefined) {
                return '(Blank)';
            } else if (Object.prototype.toString.call(value) === '[object Date]') {
                let dateFormat = d3.time.format('%b %e, %Y'); //%x
                return dateFormat(value);
            } else if (isValidURL(value)) {
                return makeURLReadable(value);
            } else {
                return String(value).substr(0, 256);
            }
        };

        export function makeURLReadable(URL: string) {
            let returnName = URL;
            if (returnName) {
                let parts = String(returnName).split(/[\\/.]/).slice(-2, -1);
                if (parts.length > 0)
                    returnName = parts[0].replace('_', ' ').replace('-', ' ');
            }
            return returnName;
        }
        
        //Simple order comparation - it is fast and works with visual properties that have always the same order
        export function objectsAreEqual(obj1, obj2) {
            let a = JSON.stringify(obj1), b = JSON.stringify(obj2);
            if (!a) a = '';
            if (!b) b = '';
            return (a.split('').sort().join('') == b.split('').sort().join(''));
        }

        //Get base palette for states using OKViz color scheme
        export function defaultPaletteForStates(length: number, comparison: string){
            
            let bestPosition = 5 + 1;

            let grayScheme = ['#999', '#8f8f8f', '#858585', '#7a7a7a', '#707070', '#666', '#5c5c5c', '#525252', '#474747', '#3d3d3d', '#333'];
            let redScheme = ['#fcb1af', '#fc9d9c', '#fc8b88', '#fc7775', '#fa6461', '#fd625e', '#fa3e3d', '#fa2c2d', '#ef131a', '#db1217', '#b40e12']; 
            let greenScheme = ['#99d5d7', '#7cc9cc', '#4cb7bd', '#5fbdc1', '#48adb2', '#399599', '#328285', '#307376', '#2a6567', '#245759', '#1e484a'];

            let scheme = (comparison.indexOf('<') > -1 ? redScheme : (comparison == '=' ? grayScheme : greenScheme));
            let colors = [];
            if (length <= bestPosition) {
                colors = scheme.slice(bestPosition - length, bestPosition);
            } else {
                colors = scheme.slice(0, Math.min(length, scheme.length));
                if (colors.length < length)
                    colors = colors.concat(Array.apply(null, Array(length - colors.length)).map(function(){ return '#333'}));
            }

            return colors;
          
        }

        export function severeAlert(element?: d3.Selection<HTMLElement>, title?: string, message?: string, height?: number, top?: number) {

            d3.selectAll('.OKVizAlert').remove();
            spinner();

            if (element) {

                let icon = '<svg width="31px" height="31px" viewBox="0 0 31 31"><g><path style= "fill:#212121" d="M15.5,0C6.9,0,0,6.9,0,15.5C0,24.1,6.9,31,15.5,31S31,24.1,31,15.5C31,6.9,24.1,0,15.5,0z M15.5,29C8,29,2,23,2,15.5S8,2,15.5,2S29,8,29,15.5S23,29,15.5,29z"/><path style= "fill:#212121" d="M22.1,9.2c-0.4-0.4-1-0.4-1.4,0l-5.2,5.2l-5.2-5.2c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l5.2,5.2 l-5.2,5.2c-0.4,0.4-0.4,1,0,1.4c0.2,0.2,0.4,0.3,0.7,0.3c0.3,0,0.5-0.1,0.7-0.3l5.2-5.2l5.2,5.2c0.2,0.2,0.4,0.3,0.7,0.3 s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4l-5.2-5.2l5.2-5.2C22.5,10.2,22.5,9.6,22.1,9.2z"/></g></svg>';

                element.append('div')
                    .classed('OKVizAlert', true)
                    .style({
                        'position': 'absolute',
                        'left': '0',
                        'top': (top ? top + 'px' : '0'),
                        'z-index': '99999',
                        'display': 'table',
                        'height': (height ? height + 'px' : '100%'),
                        'width': '100%',
                        'background': '#f4f4f4'
                    })
                    .append('div')
                    .html(icon + "<br>" + title.toUpperCase() + "<br>" + message)
                    .style({
                        "display": "table-cell",
                        "font-family": "'Segoe UI'wf_segoe-ui_normal,helvetica,arial,sans-serif",
                        "font-size": "14px",
                        "color": "#212121",
                        "padding": "10px",
                        "text-align": "center",
                        "vertical-align": "middle"
                    });
            }
        }

        /* 
            Append the following CSS to your visual.less:

            @-webkit-keyframes sk-scaleout {
                0% { -webkit-transform: scale(0) }
                100% { -webkit-transform: scale(1.0); opacity: 0; }
            }

            @keyframes sk-scaleout {
                0% { -webkit-transform: scale(0); transform: scale(0); } 
                100% { -webkit-transform: scale(1.0); transform: scale(1.0); opacity: 0; }
            }
        */
        export function spinner(element?: d3.Selection<HTMLElement>) {
            
            setTimeout(function() {
                d3.selectAll('.OKVizSpinner').remove();

                if (element) {

                    element.append('div')
                        .classed('OKVizSpinner', true)
                        .style({
                            'position': 'absolute',
                            'left': '50%',
                            'top': '50%',
                            'z-index': '99998',
                            'width':'40px',
                            'height': '40px',
                            'margin-top': '-20px',
                            'margin-left': '-20px',
                            'background-color': '#333',
                            'border-radius': '100%', 
                            '-webkit-animation': 'sk-scaleout 1.0s infinite ease-in-out',
                            'animation': 'sk-scaleout 1.0s infinite ease-in-out'
                        })
                        .append('div');
                }
            }, 1);
        }

    }
}