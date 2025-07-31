/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/sql.js/dist/sql-wasm.js":
/*!**********************************************!*\
  !*** ./node_modules/sql.js/dist/sql-wasm.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var __dirname = "/";
/* module decorator */ module = __webpack_require__.nmd(module);

// We are modularizing this manually because the current modularize setting in Emscripten has some issues:
// https://github.com/kripken/emscripten/issues/5820
// In addition, When you use emcc's modularization, it still expects to export a global object called `Module`,
// which is able to be used/called before the WASM is loaded.
// The modularization below exports a promise that loads and resolves to the actual sql.js module.
// That way, this module can't be used before the WASM is finished loading.

// We are going to define a function that a user will call to start loading initializing our Sql.js library
// However, that function might be called multiple times, and on subsequent calls, we don't actually want it to instantiate a new instance of the Module
// Instead, we want to return the previously loaded module

// TODO: Make this not declare a global if used in the browser
var initSqlJsPromise = undefined;

var initSqlJs = function (moduleConfig) {

    if (initSqlJsPromise){
      return initSqlJsPromise;
    }
    // If we're here, we've never called this function before
    initSqlJsPromise = new Promise(function (resolveModule, reject) {

        // We are modularizing this manually because the current modularize setting in Emscripten has some issues:
        // https://github.com/kripken/emscripten/issues/5820

        // The way to affect the loading of emcc compiled modules is to create a variable called `Module` and add
        // properties to it, like `preRun`, `postRun`, etc
        // We are using that to get notified when the WASM has finished loading.
        // Only then will we return our promise

        // If they passed in a moduleConfig object, use that
        // Otherwise, initialize Module to the empty object
        var Module = typeof moduleConfig !== 'undefined' ? moduleConfig : {};

        // EMCC only allows for a single onAbort function (not an array of functions)
        // So if the user defined their own onAbort function, we remember it and call it
        var originalOnAbortFunction = Module['onAbort'];
        Module['onAbort'] = function (errorThatCausedAbort) {
            reject(new Error(errorThatCausedAbort));
            if (originalOnAbortFunction){
              originalOnAbortFunction(errorThatCausedAbort);
            }
        };

        Module['postRun'] = Module['postRun'] || [];
        Module['postRun'].push(function () {
            // When Emscripted calls postRun, this promise resolves with the built Module
            resolveModule(Module);
        });

        // There is a section of code in the emcc-generated code below that looks like this:
        // (Note that this is lowercase `module`)
        // if (typeof module !== 'undefined') {
        //     module['exports'] = Module;
        // }
        // When that runs, it's going to overwrite our own modularization export efforts in shell-post.js!
        // The only way to tell emcc not to emit it is to pass the MODULARIZE=1 or MODULARIZE_INSTANCE=1 flags,
        // but that carries with it additional unnecessary baggage/bugs we don't want either.
        // So, we have three options:
        // 1) We undefine `module`
        // 2) We remember what `module['exports']` was at the beginning of this function and we restore it later
        // 3) We write a script to remove those lines of code as part of the Make process.
        //
        // Since those are the only lines of code that care about module, we will undefine it. It's the most straightforward
        // of the options, and has the side effect of reducing emcc's efforts to modify the module if its output were to change in the future.
        // That's a nice side effect since we're handling the modularization efforts ourselves
        module = undefined;

        // The emcc-generated code and shell-post.js code goes below,
        // meaning that all of it runs inside of this promise. If anything throws an exception, our promise will abort
var f;f||=typeof Module != 'undefined' ? Module : {};var aa="object"==typeof window,ba="undefined"!=typeof WorkerGlobalScope,ca="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node&&"renderer"!=process.type;"use strict";
f.onRuntimeInitialized=function(){function a(g,l){switch(typeof l){case "boolean":dc(g,l?1:0);break;case "number":ec(g,l);break;case "string":fc(g,l,-1,-1);break;case "object":if(null===l)lb(g);else if(null!=l.length){var n=da(l,ea);gc(g,n,l.length,-1);fa(n)}else va(g,"Wrong API use : tried to return a value of an unknown type ("+l+").",-1);break;default:lb(g)}}function b(g,l){for(var n=[],r=0;r<g;r+=1){var t=m(l+4*r,"i32"),y=hc(t);if(1===y||2===y)t=ic(t);else if(3===y)t=jc(t);else if(4===y){y=t;
t=kc(y);y=lc(y);for(var L=new Uint8Array(t),J=0;J<t;J+=1)L[J]=p[y+J];t=L}else t=null;n.push(t)}return n}function c(g,l){this.Qa=g;this.db=l;this.Oa=1;this.lb=[]}function d(g,l){this.db=l;l=ha(g)+1;this.eb=ia(l);if(null===this.eb)throw Error("Unable to allocate memory for the SQL string");u(g,x,this.eb,l);this.kb=this.eb;this.Za=this.pb=null}function e(g){this.filename="dbfile_"+(4294967295*Math.random()>>>0);if(null!=g){var l=this.filename,n="/",r=l;n&&(n="string"==typeof n?n:ja(n),r=l?ka(n+"/"+l):
n);l=la(!0,!0);r=ma(r,l);if(g){if("string"==typeof g){n=Array(g.length);for(var t=0,y=g.length;t<y;++t)n[t]=g.charCodeAt(t);g=n}na(r,l|146);n=oa(r,577);pa(n,g,0,g.length,0);qa(n);na(r,l)}}this.handleError(q(this.filename,h));this.db=m(h,"i32");ob(this.db);this.fb={};this.Sa={}}var h=z(4),k=f.cwrap,q=k("sqlite3_open","number",["string","number"]),w=k("sqlite3_close_v2","number",["number"]),v=k("sqlite3_exec","number",["number","string","number","number","number"]),C=k("sqlite3_changes","number",["number"]),
G=k("sqlite3_prepare_v2","number",["number","string","number","number","number"]),pb=k("sqlite3_sql","string",["number"]),nc=k("sqlite3_normalized_sql","string",["number"]),qb=k("sqlite3_prepare_v2","number",["number","number","number","number","number"]),oc=k("sqlite3_bind_text","number",["number","number","number","number","number"]),rb=k("sqlite3_bind_blob","number",["number","number","number","number","number"]),pc=k("sqlite3_bind_double","number",["number","number","number"]),qc=k("sqlite3_bind_int",
"number",["number","number","number"]),rc=k("sqlite3_bind_parameter_index","number",["number","string"]),sc=k("sqlite3_step","number",["number"]),tc=k("sqlite3_errmsg","string",["number"]),uc=k("sqlite3_column_count","number",["number"]),vc=k("sqlite3_data_count","number",["number"]),wc=k("sqlite3_column_double","number",["number","number"]),sb=k("sqlite3_column_text","string",["number","number"]),xc=k("sqlite3_column_blob","number",["number","number"]),yc=k("sqlite3_column_bytes","number",["number",
"number"]),zc=k("sqlite3_column_type","number",["number","number"]),Ac=k("sqlite3_column_name","string",["number","number"]),Bc=k("sqlite3_reset","number",["number"]),Cc=k("sqlite3_clear_bindings","number",["number"]),Dc=k("sqlite3_finalize","number",["number"]),tb=k("sqlite3_create_function_v2","number","number string number number number number number number number".split(" ")),hc=k("sqlite3_value_type","number",["number"]),kc=k("sqlite3_value_bytes","number",["number"]),jc=k("sqlite3_value_text",
"string",["number"]),lc=k("sqlite3_value_blob","number",["number"]),ic=k("sqlite3_value_double","number",["number"]),ec=k("sqlite3_result_double","",["number","number"]),lb=k("sqlite3_result_null","",["number"]),fc=k("sqlite3_result_text","",["number","string","number","number"]),gc=k("sqlite3_result_blob","",["number","number","number","number"]),dc=k("sqlite3_result_int","",["number","number"]),va=k("sqlite3_result_error","",["number","string","number"]),ub=k("sqlite3_aggregate_context","number",
["number","number"]),ob=k("RegisterExtensionFunctions","number",["number"]),vb=k("sqlite3_update_hook","number",["number","number","number"]);c.prototype.bind=function(g){if(!this.Qa)throw"Statement closed";this.reset();return Array.isArray(g)?this.Cb(g):null!=g&&"object"===typeof g?this.Db(g):!0};c.prototype.step=function(){if(!this.Qa)throw"Statement closed";this.Oa=1;var g=sc(this.Qa);switch(g){case 100:return!0;case 101:return!1;default:throw this.db.handleError(g);}};c.prototype.wb=function(g){null==
g&&(g=this.Oa,this.Oa+=1);return wc(this.Qa,g)};c.prototype.Gb=function(g){null==g&&(g=this.Oa,this.Oa+=1);g=sb(this.Qa,g);if("function"!==typeof BigInt)throw Error("BigInt is not supported");return BigInt(g)};c.prototype.Hb=function(g){null==g&&(g=this.Oa,this.Oa+=1);return sb(this.Qa,g)};c.prototype.getBlob=function(g){null==g&&(g=this.Oa,this.Oa+=1);var l=yc(this.Qa,g);g=xc(this.Qa,g);for(var n=new Uint8Array(l),r=0;r<l;r+=1)n[r]=p[g+r];return n};c.prototype.get=function(g,l){l=l||{};null!=g&&
this.bind(g)&&this.step();g=[];for(var n=vc(this.Qa),r=0;r<n;r+=1)switch(zc(this.Qa,r)){case 1:var t=l.useBigInt?this.Gb(r):this.wb(r);g.push(t);break;case 2:g.push(this.wb(r));break;case 3:g.push(this.Hb(r));break;case 4:g.push(this.getBlob(r));break;default:g.push(null)}return g};c.prototype.getColumnNames=function(){for(var g=[],l=uc(this.Qa),n=0;n<l;n+=1)g.push(Ac(this.Qa,n));return g};c.prototype.getAsObject=function(g,l){g=this.get(g,l);l=this.getColumnNames();for(var n={},r=0;r<l.length;r+=
1)n[l[r]]=g[r];return n};c.prototype.getSQL=function(){return pb(this.Qa)};c.prototype.getNormalizedSQL=function(){return nc(this.Qa)};c.prototype.run=function(g){null!=g&&this.bind(g);this.step();return this.reset()};c.prototype.sb=function(g,l){null==l&&(l=this.Oa,this.Oa+=1);g=ra(g);var n=da(g,ea);this.lb.push(n);this.db.handleError(oc(this.Qa,l,n,g.length-1,0))};c.prototype.Bb=function(g,l){null==l&&(l=this.Oa,this.Oa+=1);var n=da(g,ea);this.lb.push(n);this.db.handleError(rb(this.Qa,l,n,g.length,
0))};c.prototype.rb=function(g,l){null==l&&(l=this.Oa,this.Oa+=1);this.db.handleError((g===(g|0)?qc:pc)(this.Qa,l,g))};c.prototype.Eb=function(g){null==g&&(g=this.Oa,this.Oa+=1);rb(this.Qa,g,0,0,0)};c.prototype.tb=function(g,l){null==l&&(l=this.Oa,this.Oa+=1);switch(typeof g){case "string":this.sb(g,l);return;case "number":this.rb(g,l);return;case "bigint":this.sb(g.toString(),l);return;case "boolean":this.rb(g+0,l);return;case "object":if(null===g){this.Eb(l);return}if(null!=g.length){this.Bb(g,
l);return}}throw"Wrong API use : tried to bind a value of an unknown type ("+g+").";};c.prototype.Db=function(g){var l=this;Object.keys(g).forEach(function(n){var r=rc(l.Qa,n);0!==r&&l.tb(g[n],r)});return!0};c.prototype.Cb=function(g){for(var l=0;l<g.length;l+=1)this.tb(g[l],l+1);return!0};c.prototype.reset=function(){this.freemem();return 0===Cc(this.Qa)&&0===Bc(this.Qa)};c.prototype.freemem=function(){for(var g;void 0!==(g=this.lb.pop());)fa(g)};c.prototype.free=function(){this.freemem();var g=
0===Dc(this.Qa);delete this.db.fb[this.Qa];this.Qa=0;return g};d.prototype.next=function(){if(null===this.eb)return{done:!0};null!==this.Za&&(this.Za.free(),this.Za=null);if(!this.db.db)throw this.mb(),Error("Database closed");var g=sa(),l=z(4);ta(h);ta(l);try{this.db.handleError(qb(this.db.db,this.kb,-1,h,l));this.kb=m(l,"i32");var n=m(h,"i32");if(0===n)return this.mb(),{done:!0};this.Za=new c(n,this.db);this.db.fb[n]=this.Za;return{value:this.Za,done:!1}}catch(r){throw this.pb=ua(this.kb),this.mb(),
r;}finally{wa(g)}};d.prototype.mb=function(){fa(this.eb);this.eb=null};d.prototype.getRemainingSQL=function(){return null!==this.pb?this.pb:ua(this.kb)};"function"===typeof Symbol&&"symbol"===typeof Symbol.iterator&&(d.prototype[Symbol.iterator]=function(){return this});e.prototype.run=function(g,l){if(!this.db)throw"Database closed";if(l){g=this.prepare(g,l);try{g.step()}finally{g.free()}}else this.handleError(v(this.db,g,0,0,h));return this};e.prototype.exec=function(g,l,n){if(!this.db)throw"Database closed";
var r=sa(),t=null;try{var y=xa(g),L=z(4);for(g=[];0!==m(y,"i8");){ta(h);ta(L);this.handleError(qb(this.db,y,-1,h,L));var J=m(h,"i32");y=m(L,"i32");if(0!==J){var I=null;t=new c(J,this);for(null!=l&&t.bind(l);t.step();)null===I&&(I={columns:t.getColumnNames(),values:[]},g.push(I)),I.values.push(t.get(null,n));t.free()}}return g}catch(M){throw t&&t.free(),M;}finally{wa(r)}};e.prototype.each=function(g,l,n,r,t){"function"===typeof l&&(r=n,n=l,l=void 0);g=this.prepare(g,l);try{for(;g.step();)n(g.getAsObject(null,
t))}finally{g.free()}if("function"===typeof r)return r()};e.prototype.prepare=function(g,l){ta(h);this.handleError(G(this.db,g,-1,h,0));g=m(h,"i32");if(0===g)throw"Nothing to prepare";var n=new c(g,this);null!=l&&n.bind(l);return this.fb[g]=n};e.prototype.iterateStatements=function(g){return new d(g,this)};e.prototype["export"]=function(){Object.values(this.fb).forEach(function(l){l.free()});Object.values(this.Sa).forEach(A);this.Sa={};this.handleError(w(this.db));var g=ya(this.filename);this.handleError(q(this.filename,
h));this.db=m(h,"i32");ob(this.db);return g};e.prototype.close=function(){null!==this.db&&(Object.values(this.fb).forEach(function(g){g.free()}),Object.values(this.Sa).forEach(A),this.Sa={},this.Ya&&(A(this.Ya),this.Ya=void 0),this.handleError(w(this.db)),za("/"+this.filename),this.db=null)};e.prototype.handleError=function(g){if(0===g)return null;g=tc(this.db);throw Error(g);};e.prototype.getRowsModified=function(){return C(this.db)};e.prototype.create_function=function(g,l){Object.prototype.hasOwnProperty.call(this.Sa,
g)&&(A(this.Sa[g]),delete this.Sa[g]);var n=Aa(function(r,t,y){t=b(t,y);try{var L=l.apply(null,t)}catch(J){va(r,J,-1);return}a(r,L)},"viii");this.Sa[g]=n;this.handleError(tb(this.db,g,l.length,1,0,n,0,0,0));return this};e.prototype.create_aggregate=function(g,l){var n=l.init||function(){return null},r=l.finalize||function(I){return I},t=l.step;if(!t)throw"An aggregate function must have a step function in "+g;var y={};Object.hasOwnProperty.call(this.Sa,g)&&(A(this.Sa[g]),delete this.Sa[g]);l=g+"__finalize";
Object.hasOwnProperty.call(this.Sa,l)&&(A(this.Sa[l]),delete this.Sa[l]);var L=Aa(function(I,M,Ra){var X=ub(I,1);Object.hasOwnProperty.call(y,X)||(y[X]=n());M=b(M,Ra);M=[y[X]].concat(M);try{y[X]=t.apply(null,M)}catch(Fc){delete y[X],va(I,Fc,-1)}},"viii"),J=Aa(function(I){var M=ub(I,1);try{var Ra=r(y[M])}catch(X){delete y[M];va(I,X,-1);return}a(I,Ra);delete y[M]},"vi");this.Sa[g]=L;this.Sa[l]=J;this.handleError(tb(this.db,g,t.length-1,1,0,0,L,J,0));return this};e.prototype.updateHook=function(g){this.Ya&&
(vb(this.db,0,0),A(this.Ya),this.Ya=void 0);g&&(this.Ya=Aa(function(l,n,r,t,y){switch(n){case 18:l="insert";break;case 23:l="update";break;case 9:l="delete";break;default:throw"unknown operationCode in updateHook callback: "+n;}r=r?B(x,r):"";t=t?B(x,t):"";if(y>Number.MAX_SAFE_INTEGER)throw"rowId too big to fit inside a Number";g(l,r,t,Number(y))},"viiiij"),vb(this.db,this.Ya,0))};f.Database=e};var Ba={...f},Ca="./this.program",Da=(a,b)=>{throw b;},D="",Ea,Fa;
if(ca){var fs=__webpack_require__(/*! fs */ "?5041");__webpack_require__(/*! path */ "?c8d5");D=__dirname+"/";Fa=a=>{a=Ga(a)?new URL(a):a;return fs.readFileSync(a)};Ea=async a=>{a=Ga(a)?new URL(a):a;return fs.readFileSync(a,void 0)};!f.thisProgram&&1<process.argv.length&&(Ca=process.argv[1].replace(/\\/g,"/"));process.argv.slice(2); true&&(module.exports=f);Da=(a,b)=>{process.exitCode=a;throw b;}}else if(aa||ba)ba?D=self.location.href:"undefined"!=typeof document&&document.currentScript&&(D=document.currentScript.src),D=D.startsWith("blob:")?
"":D.slice(0,D.replace(/[?#].*/,"").lastIndexOf("/")+1),ba&&(Fa=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),Ea=async a=>{if(Ga(a))return new Promise((c,d)=>{var e=new XMLHttpRequest;e.open("GET",a,!0);e.responseType="arraybuffer";e.onload=()=>{200==e.status||0==e.status&&e.response?c(e.response):d(e.status)};e.onerror=d;e.send(null)});var b=await fetch(a,{credentials:"same-origin"});if(b.ok)return b.arrayBuffer();throw Error(b.status+
" : "+b.url);};var Ha=f.print||console.log.bind(console),Ia=f.printErr||console.error.bind(console);Object.assign(f,Ba);Ba=null;f.thisProgram&&(Ca=f.thisProgram);var Ja=f.wasmBinary,Ka,La=!1,Ma,p,x,Na,E,F,Oa,H,Pa,Ga=a=>a.startsWith("file://");
function Qa(){var a=Ka.buffer;f.HEAP8=p=new Int8Array(a);f.HEAP16=Na=new Int16Array(a);f.HEAPU8=x=new Uint8Array(a);f.HEAPU16=new Uint16Array(a);f.HEAP32=E=new Int32Array(a);f.HEAPU32=F=new Uint32Array(a);f.HEAPF32=Oa=new Float32Array(a);f.HEAPF64=Pa=new Float64Array(a);f.HEAP64=H=new BigInt64Array(a);f.HEAPU64=new BigUint64Array(a)}var K=0,Sa=null;function Ta(a){f.onAbort?.(a);a="Aborted("+a+")";Ia(a);La=!0;throw new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");}var Ua;
async function Va(a){if(!Ja)try{var b=await Ea(a);return new Uint8Array(b)}catch{}if(a==Ua&&Ja)a=new Uint8Array(Ja);else if(Fa)a=Fa(a);else throw"both async and sync fetching of the wasm failed";return a}async function Wa(a,b){try{var c=await Va(a);return await WebAssembly.instantiate(c,b)}catch(d){Ia(`failed to asynchronously prepare wasm: ${d}`),Ta(d)}}
async function Xa(a){var b=Ua;if(!Ja&&"function"==typeof WebAssembly.instantiateStreaming&&!Ga(b)&&!ca)try{var c=fetch(b,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(c,a)}catch(d){Ia(`wasm streaming compile failed: ${d}`),Ia("falling back to ArrayBuffer instantiation")}return Wa(b,a)}class Ya{name="ExitStatus";constructor(a){this.message=`Program terminated with exit(${a})`;this.status=a}}
var Za=a=>{for(;0<a.length;)a.shift()(f)},$a=[],ab=[],bb=()=>{var a=f.preRun.shift();ab.unshift(a)};function m(a,b="i8"){b.endsWith("*")&&(b="*");switch(b){case "i1":return p[a];case "i8":return p[a];case "i16":return Na[a>>1];case "i32":return E[a>>2];case "i64":return H[a>>3];case "float":return Oa[a>>2];case "double":return Pa[a>>3];case "*":return F[a>>2];default:Ta(`invalid type for getValue: ${b}`)}}var cb=f.noExitRuntime||!0;
function ta(a){var b="i32";b.endsWith("*")&&(b="*");switch(b){case "i1":p[a]=0;break;case "i8":p[a]=0;break;case "i16":Na[a>>1]=0;break;case "i32":E[a>>2]=0;break;case "i64":H[a>>3]=BigInt(0);break;case "float":Oa[a>>2]=0;break;case "double":Pa[a>>3]=0;break;case "*":F[a>>2]=0;break;default:Ta(`invalid type for setValue: ${b}`)}}
var db="undefined"!=typeof TextDecoder?new TextDecoder:void 0,B=(a,b=0,c=NaN)=>{var d=b+c;for(c=b;a[c]&&!(c>=d);)++c;if(16<c-b&&a.buffer&&db)return db.decode(a.subarray(b,c));for(d="";b<c;){var e=a[b++];if(e&128){var h=a[b++]&63;if(192==(e&224))d+=String.fromCharCode((e&31)<<6|h);else{var k=a[b++]&63;e=224==(e&240)?(e&15)<<12|h<<6|k:(e&7)<<18|h<<12|k<<6|a[b++]&63;65536>e?d+=String.fromCharCode(e):(e-=65536,d+=String.fromCharCode(55296|e>>10,56320|e&1023))}}else d+=String.fromCharCode(e)}return d},
ua=(a,b)=>a?B(x,a,b):"",eb=(a,b)=>{for(var c=0,d=a.length-1;0<=d;d--){var e=a[d];"."===e?a.splice(d,1):".."===e?(a.splice(d,1),c++):c&&(a.splice(d,1),c--)}if(b)for(;c;c--)a.unshift("..");return a},ka=a=>{var b="/"===a.charAt(0),c="/"===a.slice(-1);(a=eb(a.split("/").filter(d=>!!d),!b).join("/"))||b||(a=".");a&&c&&(a+="/");return(b?"/":"")+a},fb=a=>{var b=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);a=b[0];b=b[1];if(!a&&!b)return".";b&&=b.slice(0,-1);return a+b},
gb=a=>a&&a.match(/([^\/]+|\/)\/*$/)[1],hb=()=>{if(ca){var a=__webpack_require__(/*! crypto */ "?8893");return b=>a.randomFillSync(b)}return b=>crypto.getRandomValues(b)},ib=a=>{(ib=hb())(a)},jb=(...a)=>{for(var b="",c=!1,d=a.length-1;-1<=d&&!c;d--){c=0<=d?a[d]:"/";if("string"!=typeof c)throw new TypeError("Arguments to path.resolve must be strings");if(!c)return"";b=c+"/"+b;c="/"===c.charAt(0)}b=eb(b.split("/").filter(e=>!!e),!c).join("/");return(c?"/":"")+b||"."},kb=[],ha=a=>{for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);
127>=d?b++:2047>=d?b+=2:55296<=d&&57343>=d?(b+=4,++c):b+=3}return b},u=(a,b,c,d)=>{if(!(0<d))return 0;var e=c;d=c+d-1;for(var h=0;h<a.length;++h){var k=a.charCodeAt(h);if(55296<=k&&57343>=k){var q=a.charCodeAt(++h);k=65536+((k&1023)<<10)|q&1023}if(127>=k){if(c>=d)break;b[c++]=k}else{if(2047>=k){if(c+1>=d)break;b[c++]=192|k>>6}else{if(65535>=k){if(c+2>=d)break;b[c++]=224|k>>12}else{if(c+3>=d)break;b[c++]=240|k>>18;b[c++]=128|k>>12&63}b[c++]=128|k>>6&63}b[c++]=128|k&63}}b[c]=0;return c-e},ra=(a,b)=>
{var c=Array(ha(a)+1);a=u(a,c,0,c.length);b&&(c.length=a);return c},mb=[];function nb(a,b){mb[a]={input:[],output:[],cb:b};wb(a,xb)}
var xb={open(a){var b=mb[a.node.rdev];if(!b)throw new N(43);a.tty=b;a.seekable=!1},close(a){a.tty.cb.fsync(a.tty)},fsync(a){a.tty.cb.fsync(a.tty)},read(a,b,c,d){if(!a.tty||!a.tty.cb.xb)throw new N(60);for(var e=0,h=0;h<d;h++){try{var k=a.tty.cb.xb(a.tty)}catch(q){throw new N(29);}if(void 0===k&&0===e)throw new N(6);if(null===k||void 0===k)break;e++;b[c+h]=k}e&&(a.node.atime=Date.now());return e},write(a,b,c,d){if(!a.tty||!a.tty.cb.qb)throw new N(60);try{for(var e=0;e<d;e++)a.tty.cb.qb(a.tty,b[c+e])}catch(h){throw new N(29);
}d&&(a.node.mtime=a.node.ctime=Date.now());return e}},yb={xb(){a:{if(!kb.length){var a=null;if(ca){var b=Buffer.alloc(256),c=0,d=process.stdin.fd;try{c=fs.readSync(d,b,0,256)}catch(e){if(e.toString().includes("EOF"))c=0;else throw e;}0<c&&(a=b.slice(0,c).toString("utf-8"))}else"undefined"!=typeof window&&"function"==typeof window.prompt&&(a=window.prompt("Input: "),null!==a&&(a+="\n"));if(!a){a=null;break a}kb=ra(a,!0)}a=kb.shift()}return a},qb(a,b){null===b||10===b?(Ha(B(a.output)),a.output=[]):
0!=b&&a.output.push(b)},fsync(a){0<a.output?.length&&(Ha(B(a.output)),a.output=[])},Tb(){return{Ob:25856,Qb:5,Nb:191,Pb:35387,Mb:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},Ub(){return 0},Vb(){return[24,80]}},zb={qb(a,b){null===b||10===b?(Ia(B(a.output)),a.output=[]):0!=b&&a.output.push(b)},fsync(a){0<a.output?.length&&(Ia(B(a.output)),a.output=[])}},O={Wa:null,Xa(){return O.createNode(null,"/",16895,0)},createNode(a,b,c,d){if(24576===(c&61440)||4096===(c&61440))throw new N(63);
O.Wa||(O.Wa={dir:{node:{Ta:O.La.Ta,Ua:O.La.Ua,lookup:O.La.lookup,hb:O.La.hb,rename:O.La.rename,unlink:O.La.unlink,rmdir:O.La.rmdir,readdir:O.La.readdir,symlink:O.La.symlink},stream:{Va:O.Ma.Va}},file:{node:{Ta:O.La.Ta,Ua:O.La.Ua},stream:{Va:O.Ma.Va,read:O.Ma.read,write:O.Ma.write,ib:O.Ma.ib,jb:O.Ma.jb}},link:{node:{Ta:O.La.Ta,Ua:O.La.Ua,readlink:O.La.readlink},stream:{}},ub:{node:{Ta:O.La.Ta,Ua:O.La.Ua},stream:Ab}});c=Bb(a,b,c,d);P(c.mode)?(c.La=O.Wa.dir.node,c.Ma=O.Wa.dir.stream,c.Na={}):32768===
(c.mode&61440)?(c.La=O.Wa.file.node,c.Ma=O.Wa.file.stream,c.Ra=0,c.Na=null):40960===(c.mode&61440)?(c.La=O.Wa.link.node,c.Ma=O.Wa.link.stream):8192===(c.mode&61440)&&(c.La=O.Wa.ub.node,c.Ma=O.Wa.ub.stream);c.atime=c.mtime=c.ctime=Date.now();a&&(a.Na[b]=c,a.atime=a.mtime=a.ctime=c.atime);return c},Sb(a){return a.Na?a.Na.subarray?a.Na.subarray(0,a.Ra):new Uint8Array(a.Na):new Uint8Array(0)},La:{Ta(a){var b={};b.dev=8192===(a.mode&61440)?a.id:1;b.ino=a.id;b.mode=a.mode;b.nlink=1;b.uid=0;b.gid=0;b.rdev=
a.rdev;P(a.mode)?b.size=4096:32768===(a.mode&61440)?b.size=a.Ra:40960===(a.mode&61440)?b.size=a.link.length:b.size=0;b.atime=new Date(a.atime);b.mtime=new Date(a.mtime);b.ctime=new Date(a.ctime);b.blksize=4096;b.blocks=Math.ceil(b.size/b.blksize);return b},Ua(a,b){for(var c of["mode","atime","mtime","ctime"])null!=b[c]&&(a[c]=b[c]);void 0!==b.size&&(b=b.size,a.Ra!=b&&(0==b?(a.Na=null,a.Ra=0):(c=a.Na,a.Na=new Uint8Array(b),c&&a.Na.set(c.subarray(0,Math.min(b,a.Ra))),a.Ra=b)))},lookup(){throw O.vb;
},hb(a,b,c,d){return O.createNode(a,b,c,d)},rename(a,b,c){try{var d=Q(b,c)}catch(h){}if(d){if(P(a.mode))for(var e in d.Na)throw new N(55);Cb(d)}delete a.parent.Na[a.name];b.Na[c]=a;a.name=c;b.ctime=b.mtime=a.parent.ctime=a.parent.mtime=Date.now()},unlink(a,b){delete a.Na[b];a.ctime=a.mtime=Date.now()},rmdir(a,b){var c=Q(a,b),d;for(d in c.Na)throw new N(55);delete a.Na[b];a.ctime=a.mtime=Date.now()},readdir(a){return[".","..",...Object.keys(a.Na)]},symlink(a,b,c){a=O.createNode(a,b,41471,0);a.link=
c;return a},readlink(a){if(40960!==(a.mode&61440))throw new N(28);return a.link}},Ma:{read(a,b,c,d,e){var h=a.node.Na;if(e>=a.node.Ra)return 0;a=Math.min(a.node.Ra-e,d);if(8<a&&h.subarray)b.set(h.subarray(e,e+a),c);else for(d=0;d<a;d++)b[c+d]=h[e+d];return a},write(a,b,c,d,e,h){b.buffer===p.buffer&&(h=!1);if(!d)return 0;a=a.node;a.mtime=a.ctime=Date.now();if(b.subarray&&(!a.Na||a.Na.subarray)){if(h)return a.Na=b.subarray(c,c+d),a.Ra=d;if(0===a.Ra&&0===e)return a.Na=b.slice(c,c+d),a.Ra=d;if(e+d<=a.Ra)return a.Na.set(b.subarray(c,
c+d),e),d}h=e+d;var k=a.Na?a.Na.length:0;k>=h||(h=Math.max(h,k*(1048576>k?2:1.125)>>>0),0!=k&&(h=Math.max(h,256)),k=a.Na,a.Na=new Uint8Array(h),0<a.Ra&&a.Na.set(k.subarray(0,a.Ra),0));if(a.Na.subarray&&b.subarray)a.Na.set(b.subarray(c,c+d),e);else for(h=0;h<d;h++)a.Na[e+h]=b[c+h];a.Ra=Math.max(a.Ra,e+d);return d},Va(a,b,c){1===c?b+=a.position:2===c&&32768===(a.node.mode&61440)&&(b+=a.node.Ra);if(0>b)throw new N(28);return b},ib(a,b,c,d,e){if(32768!==(a.node.mode&61440))throw new N(43);a=a.node.Na;
if(e&2||!a||a.buffer!==p.buffer){e=!0;d=65536*Math.ceil(b/65536);var h=Db(65536,d);h&&x.fill(0,h,h+d);d=h;if(!d)throw new N(48);if(a){if(0<c||c+b<a.length)a.subarray?a=a.subarray(c,c+b):a=Array.prototype.slice.call(a,c,c+b);p.set(a,d)}}else e=!1,d=a.byteOffset;return{Kb:d,Ab:e}},jb(a,b,c,d){O.Ma.write(a,b,0,d,c,!1);return 0}}},la=(a,b)=>{var c=0;a&&(c|=365);b&&(c|=146);return c},Eb=null,Fb={},Gb=[],Hb=1,R=null,Ib=!1,Jb=!0,Kb={},N=class{name="ErrnoError";constructor(a){this.Pa=a}},Lb=class{gb={};node=null;get flags(){return this.gb.flags}set flags(a){this.gb.flags=
a}get position(){return this.gb.position}set position(a){this.gb.position=a}},Mb=class{La={};Ma={};ab=null;constructor(a,b,c,d){a||=this;this.parent=a;this.Xa=a.Xa;this.id=Hb++;this.name=b;this.mode=c;this.rdev=d;this.atime=this.mtime=this.ctime=Date.now()}get read(){return 365===(this.mode&365)}set read(a){a?this.mode|=365:this.mode&=-366}get write(){return 146===(this.mode&146)}set write(a){a?this.mode|=146:this.mode&=-147}};
function S(a,b={}){if(!a)throw new N(44);b.nb??(b.nb=!0);"/"===a.charAt(0)||(a="//"+a);var c=0;a:for(;40>c;c++){a=a.split("/").filter(q=>!!q);for(var d=Eb,e="/",h=0;h<a.length;h++){var k=h===a.length-1;if(k&&b.parent)break;if("."!==a[h])if(".."===a[h])e=fb(e),d=d.parent;else{e=ka(e+"/"+a[h]);try{d=Q(d,a[h])}catch(q){if(44===q?.Pa&&k&&b.Jb)return{path:e};throw q;}!d.ab||k&&!b.nb||(d=d.ab.root);if(40960===(d.mode&61440)&&(!k||b.$a)){if(!d.La.readlink)throw new N(52);d=d.La.readlink(d);"/"===d.charAt(0)||
(d=fb(e)+"/"+d);a=d+"/"+a.slice(h+1).join("/");continue a}}}return{path:e,node:d}}throw new N(32);}function ja(a){for(var b;;){if(a===a.parent)return a=a.Xa.zb,b?"/"!==a[a.length-1]?`${a}/${b}`:a+b:a;b=b?`${a.name}/${b}`:a.name;a=a.parent}}function Nb(a,b){for(var c=0,d=0;d<b.length;d++)c=(c<<5)-c+b.charCodeAt(d)|0;return(a+c>>>0)%R.length}function Cb(a){var b=Nb(a.parent.id,a.name);if(R[b]===a)R[b]=a.bb;else for(b=R[b];b;){if(b.bb===a){b.bb=a.bb;break}b=b.bb}}
function Q(a,b){var c=P(a.mode)?(c=Ob(a,"x"))?c:a.La.lookup?0:2:54;if(c)throw new N(c);for(c=R[Nb(a.id,b)];c;c=c.bb){var d=c.name;if(c.parent.id===a.id&&d===b)return c}return a.La.lookup(a,b)}function Bb(a,b,c,d){a=new Mb(a,b,c,d);b=Nb(a.parent.id,a.name);a.bb=R[b];return R[b]=a}function P(a){return 16384===(a&61440)}function Pb(a){var b=["r","w","rw"][a&3];a&512&&(b+="w");return b}
function Ob(a,b){if(Jb)return 0;if(!b.includes("r")||a.mode&292){if(b.includes("w")&&!(a.mode&146)||b.includes("x")&&!(a.mode&73))return 2}else return 2;return 0}function Qb(a,b){if(!P(a.mode))return 54;try{return Q(a,b),20}catch(c){}return Ob(a,"wx")}function Rb(a,b,c){try{var d=Q(a,b)}catch(e){return e.Pa}if(a=Ob(a,"wx"))return a;if(c){if(!P(d.mode))return 54;if(d===d.parent||"/"===ja(d))return 10}else if(P(d.mode))return 31;return 0}function Sb(a){if(!a)throw new N(63);return a}
function T(a){a=Gb[a];if(!a)throw new N(8);return a}function Tb(a,b=-1){a=Object.assign(new Lb,a);if(-1==b)a:{for(b=0;4096>=b;b++)if(!Gb[b])break a;throw new N(33);}a.fd=b;return Gb[b]=a}function Ub(a,b=-1){a=Tb(a,b);a.Ma?.Rb?.(a);return a}function Vb(a,b,c){var d=a?.Ma.Ua;a=d?a:b;d??=b.La.Ua;Sb(d);d(a,c)}var Ab={open(a){a.Ma=Fb[a.node.rdev].Ma;a.Ma.open?.(a)},Va(){throw new N(70);}};function wb(a,b){Fb[a]={Ma:b}}
function Wb(a,b){var c="/"===b;if(c&&Eb)throw new N(10);if(!c&&b){var d=S(b,{nb:!1});b=d.path;d=d.node;if(d.ab)throw new N(10);if(!P(d.mode))throw new N(54);}b={type:a,Wb:{},zb:b,Ib:[]};a=a.Xa(b);a.Xa=b;b.root=a;c?Eb=a:d&&(d.ab=b,d.Xa&&d.Xa.Ib.push(b))}function Xb(a,b,c){var d=S(a,{parent:!0}).node;a=gb(a);if(!a)throw new N(28);if("."===a||".."===a)throw new N(20);var e=Qb(d,a);if(e)throw new N(e);if(!d.La.hb)throw new N(63);return d.La.hb(d,a,b,c)}
function ma(a,b=438){return Xb(a,b&4095|32768,0)}function U(a,b=511){return Xb(a,b&1023|16384,0)}function Yb(a,b,c){"undefined"==typeof c&&(c=b,b=438);Xb(a,b|8192,c)}function Zb(a,b){if(!jb(a))throw new N(44);var c=S(b,{parent:!0}).node;if(!c)throw new N(44);b=gb(b);var d=Qb(c,b);if(d)throw new N(d);if(!c.La.symlink)throw new N(63);c.La.symlink(c,b,a)}
function $b(a){var b=S(a,{parent:!0}).node;a=gb(a);var c=Q(b,a),d=Rb(b,a,!0);if(d)throw new N(d);if(!b.La.rmdir)throw new N(63);if(c.ab)throw new N(10);b.La.rmdir(b,a);Cb(c)}function za(a){var b=S(a,{parent:!0}).node;if(!b)throw new N(44);a=gb(a);var c=Q(b,a),d=Rb(b,a,!1);if(d)throw new N(d);if(!b.La.unlink)throw new N(63);if(c.ab)throw new N(10);b.La.unlink(b,a);Cb(c)}function ac(a,b){a=S(a,{$a:!b}).node;return Sb(a.La.Ta)(a)}
function bc(a,b,c,d){Vb(a,b,{mode:c&4095|b.mode&-4096,ctime:Date.now(),Fb:d})}function na(a,b){a="string"==typeof a?S(a,{$a:!0}).node:a;bc(null,a,b)}function cc(a,b,c){if(P(b.mode))throw new N(31);if(32768!==(b.mode&61440))throw new N(28);var d=Ob(b,"w");if(d)throw new N(d);Vb(a,b,{size:c,timestamp:Date.now()})}
function oa(a,b,c=438){if(""===a)throw new N(44);if("string"==typeof b){var d={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090}[b];if("undefined"==typeof d)throw Error(`Unknown file open mode: ${b}`);b=d}c=b&64?c&4095|32768:0;if("object"==typeof a)d=a;else{var e=a.endsWith("/");a=S(a,{$a:!(b&131072),Jb:!0});d=a.node;a=a.path}var h=!1;if(b&64)if(d){if(b&128)throw new N(20);}else{if(e)throw new N(31);d=Xb(a,c|511,0);h=!0}if(!d)throw new N(44);8192===(d.mode&61440)&&(b&=-513);if(b&65536&&!P(d.mode))throw new N(54);
if(!h&&(e=d?40960===(d.mode&61440)?32:P(d.mode)&&("r"!==Pb(b)||b&576)?31:Ob(d,Pb(b)):44))throw new N(e);b&512&&!h&&(e=d,e="string"==typeof e?S(e,{$a:!0}).node:e,cc(null,e,0));b&=-131713;e=Tb({node:d,path:ja(d),flags:b,seekable:!0,position:0,Ma:d.Ma,Lb:[],error:!1});e.Ma.open&&e.Ma.open(e);h&&na(d,c&511);!f.logReadFiles||b&1||a in Kb||(Kb[a]=1);return e}function qa(a){if(null===a.fd)throw new N(8);a.ob&&(a.ob=null);try{a.Ma.close&&a.Ma.close(a)}catch(b){throw b;}finally{Gb[a.fd]=null}a.fd=null}
function mc(a,b,c){if(null===a.fd)throw new N(8);if(!a.seekable||!a.Ma.Va)throw new N(70);if(0!=c&&1!=c&&2!=c)throw new N(28);a.position=a.Ma.Va(a,b,c);a.Lb=[]}function Ec(a,b,c,d,e){if(0>d||0>e)throw new N(28);if(null===a.fd)throw new N(8);if(1===(a.flags&2097155))throw new N(8);if(P(a.node.mode))throw new N(31);if(!a.Ma.read)throw new N(28);var h="undefined"!=typeof e;if(!h)e=a.position;else if(!a.seekable)throw new N(70);b=a.Ma.read(a,b,c,d,e);h||(a.position+=b);return b}
function pa(a,b,c,d,e){if(0>d||0>e)throw new N(28);if(null===a.fd)throw new N(8);if(0===(a.flags&2097155))throw new N(8);if(P(a.node.mode))throw new N(31);if(!a.Ma.write)throw new N(28);a.seekable&&a.flags&1024&&mc(a,0,2);var h="undefined"!=typeof e;if(!h)e=a.position;else if(!a.seekable)throw new N(70);b=a.Ma.write(a,b,c,d,e,void 0);h||(a.position+=b);return b}
function ya(a){var b="binary";if("utf8"!==b&&"binary"!==b)throw Error(`Invalid encoding type "${b}"`);var c;var d=oa(a,d||0);a=ac(a).size;var e=new Uint8Array(a);Ec(d,e,0,a,0);"utf8"===b?c=B(e):"binary"===b&&(c=e);qa(d);return c}
function V(a,b,c){a=ka("/dev/"+a);var d=la(!!b,!!c);V.yb??(V.yb=64);var e=V.yb++<<8|0;wb(e,{open(h){h.seekable=!1},close(){c?.buffer?.length&&c(10)},read(h,k,q,w){for(var v=0,C=0;C<w;C++){try{var G=b()}catch(pb){throw new N(29);}if(void 0===G&&0===v)throw new N(6);if(null===G||void 0===G)break;v++;k[q+C]=G}v&&(h.node.atime=Date.now());return v},write(h,k,q,w){for(var v=0;v<w;v++)try{c(k[q+v])}catch(C){throw new N(29);}w&&(h.node.mtime=h.node.ctime=Date.now());return v}});Yb(a,d,e)}var W={};
function Gc(a,b,c){if("/"===b.charAt(0))return b;a=-100===a?"/":T(a).path;if(0==b.length){if(!c)throw new N(44);return a}return a+"/"+b}
function Hc(a,b){E[a>>2]=b.dev;E[a+4>>2]=b.mode;F[a+8>>2]=b.nlink;E[a+12>>2]=b.uid;E[a+16>>2]=b.gid;E[a+20>>2]=b.rdev;H[a+24>>3]=BigInt(b.size);E[a+32>>2]=4096;E[a+36>>2]=b.blocks;var c=b.atime.getTime(),d=b.mtime.getTime(),e=b.ctime.getTime();H[a+40>>3]=BigInt(Math.floor(c/1E3));F[a+48>>2]=c%1E3*1E6;H[a+56>>3]=BigInt(Math.floor(d/1E3));F[a+64>>2]=d%1E3*1E6;H[a+72>>3]=BigInt(Math.floor(e/1E3));F[a+80>>2]=e%1E3*1E6;H[a+88>>3]=BigInt(b.ino);return 0}
var Ic=void 0,Jc=()=>{var a=E[+Ic>>2];Ic+=4;return a},Kc=0,Lc=[0,31,60,91,121,152,182,213,244,274,305,335],Mc=[0,31,59,90,120,151,181,212,243,273,304,334],Nc={},Oc=a=>{Ma=a;cb||0<Kc||(f.onExit?.(a),La=!0);Da(a,new Ya(a))},Pc=a=>{if(!La)try{if(a(),!(cb||0<Kc))try{Ma=a=Ma,Oc(a)}catch(b){b instanceof Ya||"unwind"==b||Da(1,b)}}catch(b){b instanceof Ya||"unwind"==b||Da(1,b)}},Qc={},Sc=()=>{if(!Rc){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"==typeof navigator&&
navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:Ca||"./this.program"},b;for(b in Qc)void 0===Qc[b]?delete a[b]:a[b]=Qc[b];var c=[];for(b in a)c.push(`${b}=${a[b]}`);Rc=c}return Rc},Rc,xa=a=>{var b=ha(a)+1,c=z(b);u(a,x,c,b);return c},Tc=(a,b,c,d)=>{var e={string:v=>{var C=0;null!==v&&void 0!==v&&0!==v&&(C=xa(v));return C},array:v=>{var C=z(v.length);p.set(v,C);return C}};a=f["_"+a];var h=[],k=0;if(d)for(var q=0;q<d.length;q++){var w=e[c[q]];w?(0===k&&(k=sa()),h[q]=w(d[q])):
h[q]=d[q]}c=a(...h);return c=function(v){0!==k&&wa(k);return"string"===b?v?B(x,v):"":"boolean"===b?!!v:v}(c)},ea=0,da=(a,b)=>{b=1==b?z(a.length):ia(a.length);a.subarray||a.slice||(a=new Uint8Array(a));x.set(a,b);return b},Uc,Vc=[],Y,A=a=>{Uc.delete(Y.get(a));Y.set(a,null);Vc.push(a)},Aa=(a,b)=>{if(!Uc){Uc=new WeakMap;var c=Y.length;if(Uc)for(var d=0;d<0+c;d++){var e=Y.get(d);e&&Uc.set(e,d)}}if(c=Uc.get(a)||0)return c;if(Vc.length)c=Vc.pop();else{try{Y.grow(1)}catch(w){if(!(w instanceof RangeError))throw w;
throw"Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";}c=Y.length-1}try{Y.set(c,a)}catch(w){if(!(w instanceof TypeError))throw w;if("function"==typeof WebAssembly.Function){var h=WebAssembly.Function;d={i:"i32",j:"i64",f:"f32",d:"f64",e:"externref",p:"i32"};e={parameters:[],results:"v"==b[0]?[]:[d[b[0]]]};for(var k=1;k<b.length;++k)e.parameters.push(d[b[k]]);b=new h(e,a)}else{d=[1];e=b.slice(0,1);b=b.slice(1);k={i:127,p:127,j:126,f:125,d:124,e:111};d.push(96);var q=b.length;128>q?d.push(q):d.push(q%
128|128,q>>7);for(h of b)d.push(k[h]);"v"==e?d.push(0):d.push(1,k[e]);b=[0,97,115,109,1,0,0,0,1];h=d.length;128>h?b.push(h):b.push(h%128|128,h>>7);b.push(...d);b.push(2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0);b=new WebAssembly.Module(new Uint8Array(b));b=(new WebAssembly.Instance(b,{e:{f:a}})).exports.f}Y.set(c,b)}Uc.set(a,c);return c};R=Array(4096);Wb(O,"/");U("/tmp");U("/home");U("/home/web_user");
(function(){U("/dev");wb(259,{read:()=>0,write:(d,e,h,k)=>k,Va:()=>0});Yb("/dev/null",259);nb(1280,yb);nb(1536,zb);Yb("/dev/tty",1280);Yb("/dev/tty1",1536);var a=new Uint8Array(1024),b=0,c=()=>{0===b&&(ib(a),b=a.byteLength);return a[--b]};V("random",c);V("urandom",c);U("/dev/shm");U("/dev/shm/tmp")})();
(function(){U("/proc");var a=U("/proc/self");U("/proc/self/fd");Wb({Xa(){var b=Bb(a,"fd",16895,73);b.Ma={Va:O.Ma.Va};b.La={lookup(c,d){c=+d;var e=T(c);c={parent:null,Xa:{zb:"fake"},La:{readlink:()=>e.path},id:c+1};return c.parent=c},readdir(){return Array.from(Gb.entries()).filter(([,c])=>c).map(([c])=>c.toString())}};return b}},"/proc/self/fd")})();O.vb=new N(44);O.vb.stack="<generic error, no stack>";
var Xc={a:(a,b,c,d)=>Ta(`Assertion failed: ${a?B(x,a):""}, at: `+[b?b?B(x,b):"":"unknown filename",c,d?d?B(x,d):"":"unknown function"]),i:function(a,b){try{return a=a?B(x,a):"",na(a,b),0}catch(c){if("undefined"==typeof W||"ErrnoError"!==c.name)throw c;return-c.Pa}},L:function(a,b,c){try{b=b?B(x,b):"";b=Gc(a,b);if(c&-8)return-28;var d=S(b,{$a:!0}).node;if(!d)return-44;a="";c&4&&(a+="r");c&2&&(a+="w");c&1&&(a+="x");return a&&Ob(d,a)?-2:0}catch(e){if("undefined"==typeof W||"ErrnoError"!==e.name)throw e;
return-e.Pa}},j:function(a,b){try{var c=T(a);bc(c,c.node,b,!1);return 0}catch(d){if("undefined"==typeof W||"ErrnoError"!==d.name)throw d;return-d.Pa}},h:function(a){try{var b=T(a);Vb(b,b.node,{timestamp:Date.now(),Fb:!1});return 0}catch(c){if("undefined"==typeof W||"ErrnoError"!==c.name)throw c;return-c.Pa}},b:function(a,b,c){Ic=c;try{var d=T(a);switch(b){case 0:var e=Jc();if(0>e)break;for(;Gb[e];)e++;return Ub(d,e).fd;case 1:case 2:return 0;case 3:return d.flags;case 4:return e=Jc(),d.flags|=e,0;
case 12:return e=Jc(),Na[e+0>>1]=2,0;case 13:case 14:return 0}return-28}catch(h){if("undefined"==typeof W||"ErrnoError"!==h.name)throw h;return-h.Pa}},g:function(a,b){try{var c=T(a),d=c.node,e=c.Ma.Ta;a=e?c:d;e??=d.La.Ta;Sb(e);var h=e(a);return Hc(b,h)}catch(k){if("undefined"==typeof W||"ErrnoError"!==k.name)throw k;return-k.Pa}},H:function(a,b){b=-9007199254740992>b||9007199254740992<b?NaN:Number(b);try{if(isNaN(b))return 61;var c=T(a);if(0>b||0===(c.flags&2097155))throw new N(28);cc(c,c.node,b);
return 0}catch(d){if("undefined"==typeof W||"ErrnoError"!==d.name)throw d;return-d.Pa}},G:function(a,b){try{if(0===b)return-28;var c=ha("/")+1;if(b<c)return-68;u("/",x,a,b);return c}catch(d){if("undefined"==typeof W||"ErrnoError"!==d.name)throw d;return-d.Pa}},K:function(a,b){try{return a=a?B(x,a):"",Hc(b,ac(a,!0))}catch(c){if("undefined"==typeof W||"ErrnoError"!==c.name)throw c;return-c.Pa}},C:function(a,b,c){try{return b=b?B(x,b):"",b=Gc(a,b),U(b,c),0}catch(d){if("undefined"==typeof W||"ErrnoError"!==
d.name)throw d;return-d.Pa}},J:function(a,b,c,d){try{b=b?B(x,b):"";var e=d&256;b=Gc(a,b,d&4096);return Hc(c,e?ac(b,!0):ac(b))}catch(h){if("undefined"==typeof W||"ErrnoError"!==h.name)throw h;return-h.Pa}},x:function(a,b,c,d){Ic=d;try{b=b?B(x,b):"";b=Gc(a,b);var e=d?Jc():0;return oa(b,c,e).fd}catch(h){if("undefined"==typeof W||"ErrnoError"!==h.name)throw h;return-h.Pa}},v:function(a,b,c,d){try{b=b?B(x,b):"";b=Gc(a,b);if(0>=d)return-28;var e=S(b).node;if(!e)throw new N(44);if(!e.La.readlink)throw new N(28);
var h=e.La.readlink(e);var k=Math.min(d,ha(h)),q=p[c+k];u(h,x,c,d+1);p[c+k]=q;return k}catch(w){if("undefined"==typeof W||"ErrnoError"!==w.name)throw w;return-w.Pa}},u:function(a){try{return a=a?B(x,a):"",$b(a),0}catch(b){if("undefined"==typeof W||"ErrnoError"!==b.name)throw b;return-b.Pa}},f:function(a,b){try{return a=a?B(x,a):"",Hc(b,ac(a))}catch(c){if("undefined"==typeof W||"ErrnoError"!==c.name)throw c;return-c.Pa}},r:function(a,b,c){try{return b=b?B(x,b):"",b=Gc(a,b),0===c?za(b):512===c?$b(b):
Ta("Invalid flags passed to unlinkat"),0}catch(d){if("undefined"==typeof W||"ErrnoError"!==d.name)throw d;return-d.Pa}},q:function(a,b,c){try{b=b?B(x,b):"";b=Gc(a,b,!0);var d=Date.now(),e,h;if(c){var k=F[c>>2]+4294967296*E[c+4>>2],q=E[c+8>>2];1073741823==q?e=d:1073741822==q?e=null:e=1E3*k+q/1E6;c+=16;k=F[c>>2]+4294967296*E[c+4>>2];q=E[c+8>>2];1073741823==q?h=d:1073741822==q?h=null:h=1E3*k+q/1E6}else h=e=d;if(null!==(h??e)){a=e;var w=S(b,{$a:!0}).node;Sb(w.La.Ua)(w,{atime:a,mtime:h})}return 0}catch(v){if("undefined"==
typeof W||"ErrnoError"!==v.name)throw v;return-v.Pa}},m:()=>Ta(""),l:()=>{cb=!1;Kc=0},A:function(a,b){a=-9007199254740992>a||9007199254740992<a?NaN:Number(a);a=new Date(1E3*a);E[b>>2]=a.getSeconds();E[b+4>>2]=a.getMinutes();E[b+8>>2]=a.getHours();E[b+12>>2]=a.getDate();E[b+16>>2]=a.getMonth();E[b+20>>2]=a.getFullYear()-1900;E[b+24>>2]=a.getDay();var c=a.getFullYear();E[b+28>>2]=(0!==c%4||0===c%100&&0!==c%400?Mc:Lc)[a.getMonth()]+a.getDate()-1|0;E[b+36>>2]=-(60*a.getTimezoneOffset());c=(new Date(a.getFullYear(),
6,1)).getTimezoneOffset();var d=(new Date(a.getFullYear(),0,1)).getTimezoneOffset();E[b+32>>2]=(c!=d&&a.getTimezoneOffset()==Math.min(d,c))|0},y:function(a,b,c,d,e,h,k){e=-9007199254740992>e||9007199254740992<e?NaN:Number(e);try{if(isNaN(e))return 61;var q=T(d);if(0!==(b&2)&&0===(c&2)&&2!==(q.flags&2097155))throw new N(2);if(1===(q.flags&2097155))throw new N(2);if(!q.Ma.ib)throw new N(43);if(!a)throw new N(28);var w=q.Ma.ib(q,a,e,b,c);var v=w.Kb;E[h>>2]=w.Ab;F[k>>2]=v;return 0}catch(C){if("undefined"==
typeof W||"ErrnoError"!==C.name)throw C;return-C.Pa}},z:function(a,b,c,d,e,h){h=-9007199254740992>h||9007199254740992<h?NaN:Number(h);try{var k=T(e);if(c&2){c=h;if(32768!==(k.node.mode&61440))throw new N(43);if(!(d&2)){var q=x.slice(a,a+b);k.Ma.jb&&k.Ma.jb(k,q,c,b,d)}}}catch(w){if("undefined"==typeof W||"ErrnoError"!==w.name)throw w;return-w.Pa}},n:(a,b)=>{Nc[a]&&(clearTimeout(Nc[a].id),delete Nc[a]);if(!b)return 0;var c=setTimeout(()=>{delete Nc[a];Pc(()=>Wc(a,performance.now()))},b);Nc[a]={id:c,
Xb:b};return 0},B:(a,b,c,d)=>{var e=(new Date).getFullYear(),h=(new Date(e,0,1)).getTimezoneOffset();e=(new Date(e,6,1)).getTimezoneOffset();F[a>>2]=60*Math.max(h,e);E[b>>2]=Number(h!=e);b=k=>{var q=Math.abs(k);return`UTC${0<=k?"-":"+"}${String(Math.floor(q/60)).padStart(2,"0")}${String(q%60).padStart(2,"0")}`};a=b(h);b=b(e);e<h?(u(a,x,c,17),u(b,x,d,17)):(u(a,x,d,17),u(b,x,c,17))},d:()=>Date.now(),s:()=>2147483648,c:()=>performance.now(),o:a=>{var b=x.length;a>>>=0;if(2147483648<a)return!1;for(var c=
1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);a:{d=(Math.min(2147483648,65536*Math.ceil(Math.max(a,d)/65536))-Ka.buffer.byteLength+65535)/65536|0;try{Ka.grow(d);Qa();var e=1;break a}catch(h){}e=void 0}if(e)return!0}return!1},E:(a,b)=>{var c=0;Sc().forEach((d,e)=>{var h=b+c;e=F[a+4*e>>2]=h;for(h=0;h<d.length;++h)p[e++]=d.charCodeAt(h);p[e]=0;c+=d.length+1});return 0},F:(a,b)=>{var c=Sc();F[a>>2]=c.length;var d=0;c.forEach(e=>d+=e.length+1);F[b>>2]=d;return 0},e:function(a){try{var b=T(a);
qa(b);return 0}catch(c){if("undefined"==typeof W||"ErrnoError"!==c.name)throw c;return c.Pa}},p:function(a,b){try{var c=T(a);p[b]=c.tty?2:P(c.mode)?3:40960===(c.mode&61440)?7:4;Na[b+2>>1]=0;H[b+8>>3]=BigInt(0);H[b+16>>3]=BigInt(0);return 0}catch(d){if("undefined"==typeof W||"ErrnoError"!==d.name)throw d;return d.Pa}},w:function(a,b,c,d){try{a:{var e=T(a);a=b;for(var h,k=b=0;k<c;k++){var q=F[a>>2],w=F[a+4>>2];a+=8;var v=Ec(e,p,q,w,h);if(0>v){var C=-1;break a}b+=v;if(v<w)break;"undefined"!=typeof h&&
(h+=v)}C=b}F[d>>2]=C;return 0}catch(G){if("undefined"==typeof W||"ErrnoError"!==G.name)throw G;return G.Pa}},D:function(a,b,c,d){b=-9007199254740992>b||9007199254740992<b?NaN:Number(b);try{if(isNaN(b))return 61;var e=T(a);mc(e,b,c);H[d>>3]=BigInt(e.position);e.ob&&0===b&&0===c&&(e.ob=null);return 0}catch(h){if("undefined"==typeof W||"ErrnoError"!==h.name)throw h;return h.Pa}},I:function(a){try{var b=T(a);return b.Ma?.fsync?b.Ma.fsync(b):0}catch(c){if("undefined"==typeof W||"ErrnoError"!==c.name)throw c;
return c.Pa}},t:function(a,b,c,d){try{a:{var e=T(a);a=b;for(var h,k=b=0;k<c;k++){var q=F[a>>2],w=F[a+4>>2];a+=8;var v=pa(e,p,q,w,h);if(0>v){var C=-1;break a}b+=v;if(v<w)break;"undefined"!=typeof h&&(h+=v)}C=b}F[d>>2]=C;return 0}catch(G){if("undefined"==typeof W||"ErrnoError"!==G.name)throw G;return G.Pa}},k:Oc},Z;
(async function(){function a(c){Z=c.exports;Ka=Z.M;Qa();Y=Z.O;K--;f.monitorRunDependencies?.(K);0==K&&Sa&&(c=Sa,Sa=null,c());return Z}K++;f.monitorRunDependencies?.(K);var b={a:Xc};if(f.instantiateWasm)return new Promise(c=>{f.instantiateWasm(b,(d,e)=>{a(d,e);c(d.exports)})});Ua??=f.locateFile?f.locateFile("sql-wasm.wasm",D):D+"sql-wasm.wasm";return a((await Xa(b)).instance)})();f._sqlite3_free=a=>(f._sqlite3_free=Z.P)(a);f._sqlite3_value_text=a=>(f._sqlite3_value_text=Z.Q)(a);
f._sqlite3_prepare_v2=(a,b,c,d,e)=>(f._sqlite3_prepare_v2=Z.R)(a,b,c,d,e);f._sqlite3_step=a=>(f._sqlite3_step=Z.S)(a);f._sqlite3_reset=a=>(f._sqlite3_reset=Z.T)(a);f._sqlite3_exec=(a,b,c,d,e)=>(f._sqlite3_exec=Z.U)(a,b,c,d,e);f._sqlite3_finalize=a=>(f._sqlite3_finalize=Z.V)(a);f._sqlite3_column_name=(a,b)=>(f._sqlite3_column_name=Z.W)(a,b);f._sqlite3_column_text=(a,b)=>(f._sqlite3_column_text=Z.X)(a,b);f._sqlite3_column_type=(a,b)=>(f._sqlite3_column_type=Z.Y)(a,b);
f._sqlite3_errmsg=a=>(f._sqlite3_errmsg=Z.Z)(a);f._sqlite3_clear_bindings=a=>(f._sqlite3_clear_bindings=Z._)(a);f._sqlite3_value_blob=a=>(f._sqlite3_value_blob=Z.$)(a);f._sqlite3_value_bytes=a=>(f._sqlite3_value_bytes=Z.aa)(a);f._sqlite3_value_double=a=>(f._sqlite3_value_double=Z.ba)(a);f._sqlite3_value_int=a=>(f._sqlite3_value_int=Z.ca)(a);f._sqlite3_value_type=a=>(f._sqlite3_value_type=Z.da)(a);f._sqlite3_result_blob=(a,b,c,d)=>(f._sqlite3_result_blob=Z.ea)(a,b,c,d);
f._sqlite3_result_double=(a,b)=>(f._sqlite3_result_double=Z.fa)(a,b);f._sqlite3_result_error=(a,b,c)=>(f._sqlite3_result_error=Z.ga)(a,b,c);f._sqlite3_result_int=(a,b)=>(f._sqlite3_result_int=Z.ha)(a,b);f._sqlite3_result_int64=(a,b)=>(f._sqlite3_result_int64=Z.ia)(a,b);f._sqlite3_result_null=a=>(f._sqlite3_result_null=Z.ja)(a);f._sqlite3_result_text=(a,b,c,d)=>(f._sqlite3_result_text=Z.ka)(a,b,c,d);f._sqlite3_aggregate_context=(a,b)=>(f._sqlite3_aggregate_context=Z.la)(a,b);
f._sqlite3_column_count=a=>(f._sqlite3_column_count=Z.ma)(a);f._sqlite3_data_count=a=>(f._sqlite3_data_count=Z.na)(a);f._sqlite3_column_blob=(a,b)=>(f._sqlite3_column_blob=Z.oa)(a,b);f._sqlite3_column_bytes=(a,b)=>(f._sqlite3_column_bytes=Z.pa)(a,b);f._sqlite3_column_double=(a,b)=>(f._sqlite3_column_double=Z.qa)(a,b);f._sqlite3_bind_blob=(a,b,c,d,e)=>(f._sqlite3_bind_blob=Z.ra)(a,b,c,d,e);f._sqlite3_bind_double=(a,b,c)=>(f._sqlite3_bind_double=Z.sa)(a,b,c);
f._sqlite3_bind_int=(a,b,c)=>(f._sqlite3_bind_int=Z.ta)(a,b,c);f._sqlite3_bind_text=(a,b,c,d,e)=>(f._sqlite3_bind_text=Z.ua)(a,b,c,d,e);f._sqlite3_bind_parameter_index=(a,b)=>(f._sqlite3_bind_parameter_index=Z.va)(a,b);f._sqlite3_sql=a=>(f._sqlite3_sql=Z.wa)(a);f._sqlite3_normalized_sql=a=>(f._sqlite3_normalized_sql=Z.xa)(a);f._sqlite3_changes=a=>(f._sqlite3_changes=Z.ya)(a);f._sqlite3_close_v2=a=>(f._sqlite3_close_v2=Z.za)(a);
f._sqlite3_create_function_v2=(a,b,c,d,e,h,k,q,w)=>(f._sqlite3_create_function_v2=Z.Aa)(a,b,c,d,e,h,k,q,w);f._sqlite3_update_hook=(a,b,c)=>(f._sqlite3_update_hook=Z.Ba)(a,b,c);f._sqlite3_open=(a,b)=>(f._sqlite3_open=Z.Ca)(a,b);var ia=f._malloc=a=>(ia=f._malloc=Z.Da)(a),fa=f._free=a=>(fa=f._free=Z.Ea)(a);f._RegisterExtensionFunctions=a=>(f._RegisterExtensionFunctions=Z.Fa)(a);var Db=(a,b)=>(Db=Z.Ga)(a,b),Wc=(a,b)=>(Wc=Z.Ha)(a,b),wa=a=>(wa=Z.Ia)(a),z=a=>(z=Z.Ja)(a),sa=()=>(sa=Z.Ka)();
f.stackSave=()=>sa();f.stackRestore=a=>wa(a);f.stackAlloc=a=>z(a);f.cwrap=(a,b,c,d)=>{var e=!c||c.every(h=>"number"===h||"boolean"===h);return"string"!==b&&e&&!d?f["_"+a]:(...h)=>Tc(a,b,c,h)};f.addFunction=Aa;f.removeFunction=A;f.UTF8ToString=ua;f.ALLOC_NORMAL=ea;f.allocate=da;f.allocateUTF8OnStack=xa;
function Yc(){function a(){f.calledRun=!0;if(!La){if(!f.noFSInit&&!Ib){var b,c;Ib=!0;d??=f.stdin;b??=f.stdout;c??=f.stderr;d?V("stdin",d):Zb("/dev/tty","/dev/stdin");b?V("stdout",null,b):Zb("/dev/tty","/dev/stdout");c?V("stderr",null,c):Zb("/dev/tty1","/dev/stderr");oa("/dev/stdin",0);oa("/dev/stdout",1);oa("/dev/stderr",1)}Z.N();Jb=!1;f.onRuntimeInitialized?.();if(f.postRun)for("function"==typeof f.postRun&&(f.postRun=[f.postRun]);f.postRun.length;){var d=f.postRun.shift();$a.unshift(d)}Za($a)}}
if(0<K)Sa=Yc;else{if(f.preRun)for("function"==typeof f.preRun&&(f.preRun=[f.preRun]);f.preRun.length;)bb();Za(ab);0<K?Sa=Yc:f.setStatus?(f.setStatus("Running..."),setTimeout(()=>{setTimeout(()=>f.setStatus(""),1);a()},1)):a()}}if(f.preInit)for("function"==typeof f.preInit&&(f.preInit=[f.preInit]);0<f.preInit.length;)f.preInit.pop()();Yc();


        // The shell-pre.js and emcc-generated code goes above
        return Module;
    }); // The end of the promise being returned

  return initSqlJsPromise;
} // The end of our initSqlJs function

// This bit below is copied almost exactly from what you get when you use the MODULARIZE=1 flag with emcc
// However, we don't want to use the emcc modularization. See shell-pre.js
if (true){
    module.exports = initSqlJs;
    // This will allow the module to be used in ES6 or CommonJS
    module.exports["default"] = initSqlJs;
}
else {}


/***/ }),

/***/ "./src/background/database-service.ts":
/*!********************************************!*\
  !*** ./src/background/database-service.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DatabaseService: () => (/* binding */ DatabaseService),
/* harmony export */   databaseService: () => (/* binding */ databaseService)
/* harmony export */ });
/* harmony import */ var sql_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! sql.js */ "./node_modules/sql.js/dist/sql-wasm.js");
/* harmony import */ var sql_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(sql_js__WEBPACK_IMPORTED_MODULE_0__);

class DatabaseService {
    db = null;
    SQL = null;
    async initialize() {
        try {
            console.log('DatabaseService: Starting initialization...');
            // Initialize SQL.js with the WebAssembly file
            this.SQL = await sql_js__WEBPACK_IMPORTED_MODULE_0___default()({
                locateFile: (file) => {
                    if (file === 'sql-wasm.wasm') {
                        return chrome.runtime.getURL('sql-wasm.wasm');
                    }
                    return file;
                }
            });
            console.log('DatabaseService: SQL.js initialized');
            // Check if database exists in storage
            const stored = await chrome.storage.local.get('feedDatabase');
            if (stored.feedDatabase) {
                // Load existing database
                console.log('DatabaseService: Loading existing database');
                const buf = new Uint8Array(stored.feedDatabase);
                if (!this.SQL)
                    throw new Error('SQL.js not initialized');
                this.db = new this.SQL.Database(buf);
                // Verify tables exist
                if (this.db) {
                    const tables = this.db.exec("SELECT name FROM sqlite_master WHERE type='table'");
                    console.log('DatabaseService: Existing tables:', tables && tables[0] ? tables[0].values : 'none');
                }
            }
            else {
                // Create new database
                console.log('DatabaseService: Creating new database');
                if (!this.SQL)
                    throw new Error('SQL.js not initialized');
                this.db = new this.SQL.Database();
                await this.createTables();
            }
            // Check and upgrade schema if needed
            await this.upgradeSchema();
            console.log('DatabaseService: Initialization complete');
        }
        catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    }
    async createTables() {
        if (!this.db)
            throw new Error('Database not initialized');
        console.log('DatabaseService: Creating tables with enhanced schema...');
        const schema = `
      CREATE TABLE IF NOT EXISTS authors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        headline TEXT,
        profile_url TEXT,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS feed_items (
        id TEXT PRIMARY KEY,
        author_id TEXT NOT NULL,
        content TEXT,
        post_type TEXT,
        reaction_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        repost_count INTEGER DEFAULT 0,
        reaction_types TEXT,
        has_media BOOLEAN DEFAULT FALSE,
        media_type TEXT,
        media_title TEXT,
        linkedin_timestamp TIMESTAMP,
        captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        -- AI Analysis fields
        overall_score INTEGER,
        content_category TEXT,
        category_confidence REAL,
        content_quality_score REAL,
        emotional_impact_score REAL,
        user_preference_score REAL,
        is_ai_generated BOOLEAN,
        ai_confidence REAL,
        FOREIGN KEY (author_id) REFERENCES authors(id)
      );

      CREATE TABLE IF NOT EXISTS engagement_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feed_item_id TEXT NOT NULL,
        reaction_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        repost_count INTEGER DEFAULT 0,
        captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (feed_item_id) REFERENCES feed_items(id)
      );

      CREATE INDEX IF NOT EXISTS idx_feed_items_captured_at ON feed_items(captured_at);
      CREATE INDEX IF NOT EXISTS idx_feed_items_author_id ON feed_items(author_id);
      CREATE INDEX IF NOT EXISTS idx_engagement_feed_item ON engagement_snapshots(feed_item_id);
    `;
        this.db.run(schema);
        await this.saveDatabase();
        console.log('DatabaseService: Tables created successfully');
    }
    async upgradeSchema() {
        if (!this.db)
            throw new Error('Database not initialized');
        try {
            console.log('DatabaseService: Checking for schema upgrades...');
            // Check if new AI analysis columns exist
            const tableInfo = this.db.exec("PRAGMA table_info(feed_items)");
            const columns = tableInfo[0]?.values.map(row => row[1]) || [];
            const newColumns = [
                'overall_score', 'content_category', 'category_confidence',
                'content_quality_score', 'emotional_impact_score', 'user_preference_score',
                'is_ai_generated', 'ai_confidence'
            ];
            let needsUpgrade = false;
            for (const col of newColumns) {
                if (!columns.includes(col)) {
                    console.log(`DatabaseService: Missing column: ${col}`);
                    needsUpgrade = true;
                }
            }
            if (needsUpgrade) {
                console.log('DatabaseService: Upgrading schema...');
                // Add missing columns
                const alterStatements = [
                    'ALTER TABLE feed_items ADD COLUMN overall_score INTEGER',
                    'ALTER TABLE feed_items ADD COLUMN content_category TEXT',
                    'ALTER TABLE feed_items ADD COLUMN category_confidence REAL',
                    'ALTER TABLE feed_items ADD COLUMN content_quality_score REAL',
                    'ALTER TABLE feed_items ADD COLUMN emotional_impact_score REAL',
                    'ALTER TABLE feed_items ADD COLUMN user_preference_score REAL',
                    'ALTER TABLE feed_items ADD COLUMN is_ai_generated BOOLEAN',
                    'ALTER TABLE feed_items ADD COLUMN ai_confidence REAL'
                ];
                for (const statement of alterStatements) {
                    try {
                        this.db.run(statement);
                    }
                    catch (error) {
                        // Column might already exist, that's okay
                        console.log(`DatabaseService: Column alter skipped (might exist): ${error}`);
                    }
                }
                await this.saveDatabase();
                console.log('DatabaseService: Schema upgrade completed');
            }
            else {
                console.log('DatabaseService: Schema is up to date');
            }
        }
        catch (error) {
            console.error('DatabaseService: Schema upgrade failed:', error);
            // Don't throw - let the database work with whatever schema it has
        }
    }
    async saveDatabase() {
        if (!this.db)
            return;
        const data = this.db.export();
        await chrome.storage.local.set({ feedDatabase: Array.from(data) });
    }
    async feedItemExists(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare("SELECT 1 FROM feed_items WHERE id = ?");
        const result = stmt.get([id]);
        stmt.free();
        return !!result;
    }
    async upsertAuthor(author) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      INSERT INTO authors (id, name, headline, profile_url, verified)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        headline = excluded.headline,
        profile_url = excluded.profile_url,
        verified = excluded.verified,
        updated_at = CURRENT_TIMESTAMP
    `);
        stmt.run([author.id, author.name, author.headline, author.profileUrl, author.verified ? 1 : 0]);
        stmt.free();
        await this.saveDatabase();
    }
    async insertFeedItem(item) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      INSERT INTO feed_items (
        id, author_id, content, post_type, reaction_count, 
        comment_count, repost_count, reaction_types, has_media, 
        media_type, media_title, linkedin_timestamp,
        overall_score, content_category, category_confidence,
        content_quality_score, emotional_impact_score, user_preference_score,
        is_ai_generated, ai_confidence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run([
            item.id,
            item.authorId,
            item.content,
            item.postType,
            item.reactionCount,
            item.commentCount,
            item.repostCount,
            JSON.stringify(item.reactionTypes),
            item.hasMedia ? 1 : 0,
            item.mediaType || null,
            item.mediaTitle || null,
            item.linkedinTimestamp,
            // AI Analysis fields
            item.overallScore || null,
            item.contentCategory || null,
            item.categoryConfidence || null,
            item.contentQualityScore || null,
            item.emotionalImpactScore || null,
            item.userPreferenceScore || null,
            item.isAIGenerated ? 1 : 0,
            item.aiConfidence || null
        ]);
        stmt.free();
        // Create initial engagement snapshot
        await this.createEngagementSnapshot({
            feedItemId: item.id,
            reactionCount: item.reactionCount,
            commentCount: item.commentCount,
            repostCount: item.repostCount,
            capturedAt: new Date().toISOString()
        });
        await this.saveDatabase();
    }
    async createEngagementSnapshot(snapshot) {
        if (!this.db)
            throw new Error('Database not initialized');
        const stmt = this.db.prepare(`
      INSERT INTO engagement_snapshots (feed_item_id, reaction_count, comment_count, repost_count)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run([
            snapshot.feedItemId,
            snapshot.reactionCount,
            snapshot.commentCount,
            snapshot.repostCount
        ]);
        stmt.free();
    }
    async processFeedItem(data) {
        if (!this.db)
            throw new Error('Database not initialized');
        console.log('DatabaseService: Processing feed item:', data.id);
        // Convert from feed analyzer format to database format
        const author = data.author;
        const feedItem = {
            id: data.id,
            authorId: author.id,
            content: data.content,
            postType: data.postType,
            reactionCount: data.reactionCount,
            commentCount: data.commentCount,
            repostCount: data.repostCount,
            reactionTypes: data.reactionTypes,
            hasMedia: data.hasMedia,
            mediaType: data.mediaType,
            mediaTitle: data.mediaTitle,
            linkedinTimestamp: data.timestamp
        };
        // Check if item already exists
        const exists = await this.feedItemExists(feedItem.id);
        if (exists) {
            console.log('DatabaseService: Feed item already exists, updating engagement snapshot');
            // Update engagement snapshot for existing item
            await this.createEngagementSnapshot({
                feedItemId: feedItem.id,
                reactionCount: feedItem.reactionCount,
                commentCount: feedItem.commentCount,
                repostCount: feedItem.repostCount,
                capturedAt: new Date().toISOString()
            });
            return { status: 'updated' };
        }
        console.log('DatabaseService: Inserting new feed item');
        // Insert new author or update existing
        await this.upsertAuthor(author);
        // Insert new feed item
        await this.insertFeedItem(feedItem);
        // Create initial engagement snapshot
        await this.createEngagementSnapshot({
            feedItemId: feedItem.id,
            reactionCount: feedItem.reactionCount,
            commentCount: feedItem.commentCount,
            repostCount: feedItem.repostCount,
            capturedAt: new Date().toISOString()
        });
        console.log('DatabaseService: Feed item inserted successfully');
        return { status: 'inserted' };
    }
    async getStatistics() {
        if (!this.db)
            throw new Error('Database not initialized');
        // Basic counts
        const totalPosts = this.db.exec("SELECT COUNT(*) as count FROM feed_items")[0]?.values[0][0] || 0;
        const uniqueAuthors = this.db.exec("SELECT COUNT(*) as count FROM authors")[0]?.values[0][0] || 0;
        // Average engagement
        const avgEngagementResult = this.db.exec(`
      SELECT AVG(reaction_count + comment_count + repost_count) as avg_engagement 
      FROM feed_items
    `)[0];
        const avgEngagement = avgEngagementResult?.values[0][0] || 0;
        // Top authors with post count and average engagement
        const topAuthorsResult = this.db.exec(`
      SELECT 
        a.name,
        COUNT(f.id) as post_count,
        AVG(f.reaction_count + f.comment_count + f.repost_count) as avg_engagement
      FROM authors a
      JOIN feed_items f ON a.id = f.author_id
      GROUP BY a.id, a.name
      ORDER BY post_count DESC
      LIMIT 10
    `)[0];
        const topAuthors = [];
        if (topAuthorsResult) {
            topAuthorsResult.values.forEach((row) => {
                topAuthors.push({
                    name: row[0],
                    postCount: row[1],
                    avgEngagement: Math.round(row[2] || 0)
                });
            });
        }
        // Content type distribution
        const contentTypesResult = this.db.exec(`
      SELECT post_type, COUNT(*) as count
      FROM feed_items
      WHERE post_type IS NOT NULL
      GROUP BY post_type
      ORDER BY count DESC
    `)[0];
        const contentTypes = [];
        if (contentTypesResult) {
            contentTypesResult.values.forEach((row) => {
                contentTypes.push({
                    type: row[0],
                    count: row[1]
                });
            });
        }
        // Daily stats (last 7 days)
        const dailyStatsResult = this.db.exec(`
      SELECT 
        DATE(captured_at) as date,
        COUNT(*) as post_count,
        AVG(reaction_count + comment_count + repost_count) as avg_score
      FROM feed_items
      WHERE captured_at >= datetime('now', '-7 days')
      GROUP BY DATE(captured_at)
      ORDER BY date DESC
    `)[0];
        const dailyStats = [];
        if (dailyStatsResult) {
            dailyStatsResult.values.forEach((row) => {
                dailyStats.push({
                    date: row[0],
                    postCount: row[1],
                    avgScore: Math.round(row[2] || 0)
                });
            });
        }
        // Enhanced Author Category Analysis
        const authorCategoryAnalysis = [];
        // Get detailed author analysis
        const authorAnalysisResult = this.db.exec(`
      SELECT 
        a.id as author_id,
        a.name as author_name,
        a.verified,
        COUNT(f.id) as post_count,
        AVG(COALESCE(f.overall_score, 0)) as avg_score,
        MIN(COALESCE(f.overall_score, 0)) as min_score,
        MAX(COALESCE(f.overall_score, 0)) as max_score,
        AVG(f.reaction_count + f.comment_count + f.repost_count) as avg_engagement,
        COUNT(CASE WHEN f.is_ai_generated = 1 THEN 1 END) as ai_generated_count,
        COUNT(CASE WHEN f.overall_score >= 80 THEN 1 END) as excellent_count,
        COUNT(CASE WHEN f.overall_score >= 60 AND f.overall_score < 80 THEN 1 END) as good_count,
        COUNT(CASE WHEN f.overall_score >= 40 AND f.overall_score < 60 THEN 1 END) as fair_count,
        COUNT(CASE WHEN f.overall_score < 40 THEN 1 END) as poor_count,
        MIN(DATE(f.captured_at)) as first_post_date,
        MAX(DATE(f.captured_at)) as last_post_date
      FROM authors a
      LEFT JOIN feed_items f ON a.id = f.author_id
      WHERE f.id IS NOT NULL
      GROUP BY a.id, a.name, a.verified
      ORDER BY post_count DESC
      LIMIT 20
    `)[0];
        if (authorAnalysisResult) {
            for (const row of authorAnalysisResult.values) {
                const authorId = row[0];
                const authorName = row[1];
                const verified = row[2];
                const postCount = row[3];
                const avgScore = row[4];
                const minScore = row[5];
                const maxScore = row[6];
                const avgEngagement = row[7];
                const aiGeneratedCount = row[8];
                const excellentCount = row[9];
                const goodCount = row[10];
                const fairCount = row[11];
                const poorCount = row[12];
                const firstPostDate = row[13];
                const lastPostDate = row[14];
                // Get category breakdown for this author
                const stmt = this.db.prepare("SELECT content_category, COUNT(*) as count FROM feed_items WHERE author_id = ? AND content_category IS NOT NULL GROUP BY content_category ORDER BY count DESC");
                const categories = [];
                try {
                    stmt.bind([authorId]);
                    while (stmt.step()) {
                        const row = stmt.getAsObject();
                        categories.push({
                            category: row.content_category,
                            count: row.count,
                            percentage: Math.round((row.count / postCount) * 100)
                        });
                    }
                }
                finally {
                    stmt.free();
                }
                // Calculate posting frequency
                let postingFrequency = 'Unknown';
                if (firstPostDate && lastPostDate && postCount > 1) {
                    const daysDiff = Math.max(1, Math.ceil((new Date(lastPostDate).getTime() - new Date(firstPostDate).getTime()) / (1000 * 60 * 60 * 24)));
                    const postsPerDay = postCount / daysDiff;
                    if (postsPerDay >= 1) {
                        postingFrequency = `${Math.round(postsPerDay * 10) / 10} posts/day`;
                    }
                    else {
                        const daysPerPost = Math.round(daysDiff / postCount);
                        postingFrequency = `1 post/${daysPerPost} days`;
                    }
                }
                authorCategoryAnalysis.push({
                    authorName,
                    authorId,
                    postCount,
                    categories,
                    avgScore: Math.round(avgScore),
                    scoreRange: { min: Math.round(minScore), max: Math.round(maxScore) },
                    scoreDistribution: {
                        excellent: excellentCount,
                        good: goodCount,
                        fair: fairCount,
                        poor: poorCount
                    },
                    avgEngagement: Math.round(avgEngagement),
                    aiGeneratedCount,
                    aiGeneratedPercentage: Math.round((aiGeneratedCount / postCount) * 100),
                    postingFrequency,
                    verified: verified === 1
                });
            }
        }
        // Category Overview
        const categoryOverviewResult = this.db.exec(`
      SELECT 
        content_category,
        COUNT(*) as count,
        AVG(COALESCE(overall_score, 0)) as avg_score,
        GROUP_CONCAT(a.name) as authors
      FROM feed_items f
      JOIN authors a ON f.author_id = a.id
      WHERE content_category IS NOT NULL
      GROUP BY content_category
      ORDER BY count DESC
    `)[0];
        const categoryOverview = [];
        if (categoryOverviewResult) {
            categoryOverviewResult.values.forEach((row) => {
                const authors = (row[3] || '').split(', ').slice(0, 5); // Top 5 authors
                categoryOverview.push({
                    category: row[0],
                    count: row[1],
                    avgScore: Math.round(row[2] || 0),
                    topAuthors: authors.filter(author => author.length > 0)
                });
            });
        }
        // Score Range Analysis
        const scoreRangeResult = this.db.exec(`
      SELECT 
        CASE 
          WHEN overall_score >= 80 THEN 'excellent'
          WHEN overall_score >= 60 THEN 'good'
          WHEN overall_score >= 40 THEN 'fair'
          ELSE 'poor'
        END as score_range,
        COUNT(*) as count,
        GROUP_CONCAT(a.name) as authors
      FROM feed_items f
      JOIN authors a ON f.author_id = a.id
      WHERE overall_score IS NOT NULL
      GROUP BY score_range
      ORDER BY count DESC
    `)[0];
        const scoreRangeAnalysis = {
            excellent: { count: 0, authors: [] },
            good: { count: 0, authors: [] },
            fair: { count: 0, authors: [] },
            poor: { count: 0, authors: [] }
        };
        if (scoreRangeResult) {
            scoreRangeResult.values.forEach((row) => {
                const range = row[0];
                const count = row[1];
                const authors = (row[2] || '').split(', ').slice(0, 10);
                if (range in scoreRangeAnalysis) {
                    scoreRangeAnalysis[range] = {
                        count,
                        authors: authors.filter((author) => author.length > 0)
                    };
                }
            });
        }
        return {
            totalPosts,
            uniqueAuthors,
            avgEngagement: Math.round(avgEngagement),
            topAuthors,
            contentTypes,
            dailyStats,
            authorCategoryAnalysis,
            categoryOverview,
            scoreRangeAnalysis
        };
    }
    async getDebugInfo() {
        if (!this.db)
            throw new Error('Database not initialized');
        const debugInfo = {
            tables: [],
            counts: {},
            recentItems: [],
            sampleData: {}
        };
        try {
            // Get all tables
            const tablesResult = this.db.exec("SELECT name FROM sqlite_master WHERE type='table'");
            if (tablesResult.length > 0) {
                debugInfo.tables = tablesResult[0].values.map(row => row[0]);
            }
            // Get counts for each table
            for (const tableName of debugInfo.tables) {
                try {
                    const countResult = this.db.exec(`SELECT COUNT(*) as count FROM ${tableName}`);
                    debugInfo.counts[tableName] = countResult[0]?.values[0][0] || 0;
                }
                catch (error) {
                    debugInfo.counts[tableName] = `error: ${error}`;
                }
            }
            // Get recent feed items
            try {
                const recentResult = this.db.exec(`
          SELECT id, content, author_id, overall_score, content_category, captured_at
          FROM feed_items 
          ORDER BY captured_at DESC 
          LIMIT 5
        `);
                if (recentResult.length > 0) {
                    debugInfo.recentItems = recentResult[0].values.map(row => ({
                        id: row[0],
                        content: row[1]?.substring(0, 100) + '...',
                        authorId: row[2],
                        score: row[3],
                        category: row[4],
                        capturedAt: row[5]
                    }));
                }
            }
            catch (error) {
                debugInfo.recentItems = `error: ${error}`;
            }
            // Sample data from each main table
            try {
                const authorsResult = this.db.exec("SELECT COUNT(*), GROUP_CONCAT(name) as names FROM authors LIMIT 5");
                if (authorsResult.length > 0) {
                    debugInfo.sampleData.authors = {
                        count: authorsResult[0].values[0][0],
                        sampleNames: authorsResult[0].values[0][1]
                    };
                }
            }
            catch (error) {
                debugInfo.sampleData.authors = `error: ${error}`;
            }
        }
        catch (error) {
            debugInfo.error = error instanceof Error ? error.message : String(error);
        }
        return debugInfo;
    }
    async exportData() {
        if (!this.db)
            throw new Error('Database not initialized');
        const feedItems = this.db.exec(`
      SELECT 
        fi.*, 
        a.name as author_name, 
        a.headline as author_headline,
        a.verified as author_verified
      FROM feed_items fi
      JOIN authors a ON fi.author_id = a.id
      ORDER BY fi.captured_at DESC
    `);
        if (feedItems.length === 0) {
            return JSON.stringify({ feedItems: [], authors: [] }, null, 2);
        }
        const columns = feedItems[0].columns;
        const rows = feedItems[0].values;
        const formattedItems = rows.map((row) => {
            const item = {};
            columns.forEach((col, index) => {
                item[col] = row[index];
            });
            return item;
        });
        return JSON.stringify({ feedItems: formattedItems }, null, 2);
    }
}
// Export singleton instance
const databaseService = new DatabaseService();


/***/ }),

/***/ "./src/background/ollama-service.ts":
/*!******************************************!*\
  !*** ./src/background/ollama-service.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OllamaService: () => (/* binding */ OllamaService),
/* harmony export */   ollamaService: () => (/* binding */ ollamaService)
/* harmony export */ });
/* harmony import */ var _utils_error_logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/error-logger */ "./src/utils/error-logger.ts");

class OllamaService {
    static instance;
    baseUrl = 'http://localhost:11434';
    isAvailable = false;
    availableModels = [];
    constructor() {
        this.checkAvailability();
    }
    static getInstance() {
        if (!OllamaService.instance) {
            OllamaService.instance = new OllamaService();
        }
        return OllamaService.instance;
    }
    async checkAvailability() {
        try {
            console.log('Checking Ollama availability at:', this.baseUrl);
            // Try direct fetch first
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                this.availableModels = data.models || [];
                this.isAvailable = true;
                console.log('Ollama is available with models:', this.availableModels.map(m => m.name));
                return true;
            }
            else {
                console.log('Ollama responded with status:', response.status);
            }
        }
        catch (error) {
            // If CORS fails, try a simple health check
            try {
                console.log('Initial check failed, trying alternative endpoint...');
                await fetch(`${this.baseUrl}/api/version`, {
                    method: 'GET',
                    mode: 'no-cors' // This won't give us the response body but will tell us if the server exists
                });
                // If we get here without an error, Ollama is likely running but has CORS issues
                console.log('Ollama appears to be running but may have CORS restrictions');
                // Try to use it anyway - the actual API calls might work
                this.isAvailable = true;
                this.availableModels = [
                    { name: 'llama3.2', size: 0, digest: '', modified_at: '' },
                    { name: 'gemma3:4b', size: 0, digest: '', modified_at: '' },
                    { name: 'mistral', size: 0, digest: '', modified_at: '' },
                    { name: 'phi3', size: 0, digest: '', modified_at: '' }
                ];
                return true;
            }
            catch (innerError) {
                console.log('Ollama is not accessible:', innerError);
                await _utils_error_logger__WEBPACK_IMPORTED_MODULE_0__.errorLogger.logError('ollama-service', 'check-availability', innerError, 'medium', {
                    baseUrl: this.baseUrl,
                    attemptType: 'fallback-health-check'
                });
            }
        }
        this.isAvailable = false;
        await _utils_error_logger__WEBPACK_IMPORTED_MODULE_0__.errorLogger.logMessage('ollama-service', 'check-availability', 'Ollama service is unavailable', 'medium', {
            baseUrl: this.baseUrl
        });
        return false;
    }
    getAvailableModels() {
        return this.availableModels.map(model => model.name);
    }
    isOllamaAvailable() {
        return this.isAvailable;
    }
    async analyzeContent(post, modelName = 'llama3.2', userSettings) {
        if (!this.isAvailable) {
            const error = new Error('Ollama service is not available');
            await _utils_error_logger__WEBPACK_IMPORTED_MODULE_0__.errorLogger.logError('ollama-service', 'analyze-content', error, 'high', {
                postId: post.id,
                platform: post.platform,
                modelName,
                ollamaAvailable: this.isAvailable
            });
            throw error;
        }
        const prompt = this.createAnalysisPrompt(post, userSettings);
        try {
            // Use Chrome extension compatible fetch for localhost
            const requestBody = {
                model: modelName,
                prompt: prompt,
                stream: false,
                format: 'json',
                system: `You are a multilingual content quality analyzer. Analyze social media posts in ANY language (English, German, French, Spanish, etc.) and provide consistent ratings in JSON format.

IMPORTANT: You must analyze content and detect patterns regardless of language. Apply the same quality standards and classification logic to German, English, French, or any other language.

Rate each aspect on a scale of 1-10:
- Content Quality (writingQuality, informationDensity, sourceCredibility, originality)
- Emotional Impact (toxicityLevel, emotionalManipulation, socialHarmony)
- User Preferences (topicAlignment, sourcePreference, historicalInteraction)

RATING METRICS EXPLAINED:
- writingQuality: Clarity, structure, grammar, and coherence of the content
- informationDensity: Amount of useful, substantive information per word
- sourceCredibility: Author expertise, reliability, and trustworthiness
- originality: New insights and original thought vs. recycled/reshared content
- topicAlignment: How well content matches user's stated interests
- sourcePreference: Whether author/source is preferred by user
- historicalInteraction: Similarity to previously engaged content

ORIGINALITY SCORING GUIDE (1-10):
- 10: Completely original research, analysis, or groundbreaking insights
- 8-9: Original perspective or unique take on existing topics
- 6-7: Curated content with meaningful personal insights added
- 4-5: Simple reshare with minimal commentary (e.g., "Great post by X")
- 2-3: Copy-paste or "look what X posted" type content
- 1: Pure repost with no added value

AI-GENERATED CONTENT DETECTION:
Analyze the content for signs of AI generation. Look for:
- Overly polished, formulaic writing style
- Generic, templated structure (e.g., "In today's digital age...")
- Excessive use of transitional phrases and formal language
- Lack of personal anecdotes or specific experiences
- Uniform paragraph structure and sentence length
- Overuse of lists and bullet points in a mechanical way
- Generic examples without specific details
- Hedging language and lack of strong opinions
- Perfect grammar but lacking authentic voice
- Common AI phrases: "it's important to note", "in conclusion", "furthermore", "additionally"
- Use of em-dash (—) instead of regular dash (-) or comma
- Excessive emojis (3+ emojis in a single post)
- Overly enthusiastic tone with multiple exclamation marks
- Pattern of "Here's" or "Let's" at the beginning of sentences

If content appears AI-generated, this should SIGNIFICANTLY impact the originality score (max 3/10).

CONTENT CLASSIFICATION GUIDE (apply to any language):
- personal: Personal stories, life updates, emotional experiences, opinions, casual conversations
- business: Business strategies, company updates, professional insights, entrepreneurship, management tips  
- tech: Technology news, software development, IT topics, gadgets, AI/ML, cybersecurity
- finance: Financial markets, investments, economic news, banking, cryptocurrency, trading
- news: Current events, journalism, breaking news, media reports from news organizations (NOT company PR)
- entertainment: Movies, music, games, sports, celebrity news, humor, memes
- education: Tutorials, courses, learning resources, how-to guides, academic content, skill development
- advertisement: Product promotions, sponsored content, commercial offers, sales pitches, marketing campaigns
- promotion: Personal branding, self-promotion, networking posts, achievements (non-commercial)
- politics: Political news, government policies, elections, political opinions, activism
- other: Content that doesn't clearly fit other categories

MULTILINGUAL CLASSIFICATION SIGNALS:
Detect these patterns in ANY language:
- Sponsored/promoted content indicators:
  * English: "Sponsored", "Promoted", "Ad"
  * German: "Anzeige", "Gesponsert", "Beworben", "Werbung"  
  * French: "Sponsorisé", "Publicité", "Annonce"
- Commercial language (English: "Buy now", German: "Jetzt kaufen", French: "Acheter maintenant")
- Call-to-action phrases (English: "Sign up", German: "Hier anmelden", French: "S'inscrire")
- Company promotional content vs. news reporting
- Personal achievements vs. commercial advertisements
- Educational content vs. sales pitches

CRITICAL: If you see "Anzeige" anywhere in German content, this is ALWAYS an advertisement, regardless of the content topic.

IMPORTANT DISTINCTIONS:
- Posts labeled "Anzeige" (German) or "Sponsored" (English) = ALWAYS "advertisement"  
- News articles from established media (t3n, BBC, CNN, etc.) = "news" even if they mention products
- Company posts selling products/services = "advertisement"
- Individuals sharing personal achievements = "promotion"  
- Product reviews by regular users = "personal" or relevant category (not "advertisement")
- Educational tutorials teaching skills = "education"

Respond ONLY with valid JSON matching this EXACT structure:

{
  "contentQuality": {
    "writingQuality": 7,
    "informationDensity": 6,
    "sourceCredibility": 8,
    "originality": 5
  },
  "emotionalImpact": {
    "toxicityLevel": 3,
    "emotionalManipulation": 4,
    "socialHarmony": 7
  },
  "userPreferences": {
    "topicAlignment": 6,
    "sourcePreference": 7,
    "historicalInteraction": 5
  },
  "contentType": {
    "category": "business",
    "confidence": 0.85
  },
  "isAIGenerated": false,
  "aiConfidence": 0.2
}

Where:
- All quality scores are 1-10 (higher is better except toxicity/manipulation)
- category must be: personal, business, tech, finance, news, entertainment, education, advertisement, promotion, politics, or other
- confidence and aiConfidence are 0-1 (decimal values)
- isAIGenerated is boolean (true/false)

CRITICAL: Return ONLY the JSON object, no additional text or explanation.`
            };
            // Chrome extension compatible fetch - no explicit timeout needed as Chrome handles it
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                const errorDetails = {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                    headers: Object.fromEntries(response.headers.entries())
                };
                let errorBody = '';
                try {
                    errorBody = await response.text();
                }
                catch (e) {
                    // Ignore if we can't read the body
                }
                const errorMessage = `Ollama API error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`;
                console.error('Ollama API response error:', errorDetails);
                throw new Error(errorMessage);
            }
            const data = await response.json();
            const rating = await this.parseOllamaResponse(data.response);
            // Add debug info to the rating object
            rating.debugInfo = {
                prompt,
                response: data.response,
                timestamp: Date.now()
            };
            return rating;
        }
        catch (error) {
            console.error('Error calling Ollama API:', error);
            await _utils_error_logger__WEBPACK_IMPORTED_MODULE_0__.errorLogger.logError('ollama-service', 'ollama-api-call', error, 'high', {
                postId: post.id,
                platform: post.platform,
                modelName,
                baseUrl: this.baseUrl,
                promptLength: prompt.length
            });
            throw error;
        }
    }
    createAnalysisPrompt(post, userSettings) {
        const contextInfo = [];
        // Add title if available
        if (post.title) {
            contextInfo.push(`Title: "${post.title}"`);
        }
        // Add author profile information
        if (post.contextualInfo?.authorProfile) {
            contextInfo.push(`Author Profile: ${post.contextualInfo.authorProfile}`);
        }
        // Add post type context
        if (post.contextualInfo?.postType) {
            contextInfo.push(`Post Type: ${post.contextualInfo.postType}`);
        }
        // Add media and link information
        const mediaInfo = [];
        if (post.contextualInfo?.hasMedia)
            mediaInfo.push('contains media');
        if (post.contextualInfo?.hasLinks)
            mediaInfo.push('contains external links');
        if (mediaInfo.length > 0) {
            contextInfo.push(`Media: ${mediaInfo.join(', ')}`);
        }
        // Add engagement metrics if available
        if (post.contextualInfo?.engagementMetrics) {
            const metrics = post.contextualInfo.engagementMetrics;
            const engagementParts = [];
            if (metrics.likes)
                engagementParts.push(`${metrics.likes} likes`);
            if (metrics.comments)
                engagementParts.push(`${metrics.comments} comments`);
            if (metrics.shares)
                engagementParts.push(`${metrics.shares} shares`);
            if (engagementParts.length > 0) {
                contextInfo.push(`Engagement: ${engagementParts.join(', ')}`);
            }
        }
        // Add platform-specific hints (but let AI make final decision)
        if (post.contextualInfo?.platformSpecific) {
            const hints = [];
            const platformData = post.contextualInfo.platformSpecific;
            if (platformData.hasPromotedTag)
                hints.push('platform shows promoted/sponsored indicators');
            if (platformData.hasFollowersInfo)
                hints.push('author has follower count visible');
            if (platformData.hasExternalArticle)
                hints.push('links to external article');
            if (hints.length > 0) {
                contextInfo.push(`Platform Signals: ${hints.join(', ')}`);
            }
        }
        // Add user preferences if provided
        if (userSettings) {
            if (userSettings.userPrompt) {
                contextInfo.push(`User Content Preferences: ${userSettings.userPrompt}`);
            }
            if (userSettings.interestKeywords && userSettings.interestKeywords.length > 0) {
                contextInfo.push(`Topics of Interest: ${userSettings.interestKeywords.join(', ')}`);
            }
            if (userSettings.avoidKeywords && userSettings.avoidKeywords.length > 0) {
                contextInfo.push(`Topics to Avoid: ${userSettings.avoidKeywords.join(', ')}`);
            }
            if (userSettings.preferOriginalContent !== undefined) {
                contextInfo.push(`Original Content Preference: ${userSettings.preferOriginalContent ? 'Strongly prefer original content' : 'No strong preference for original content'}`);
            }
        }
        return `Analyze this social media post and provide comprehensive ratings. Consider the user's stated preferences when evaluating topicAlignment and overall value.

Content: "${post.content}"
Author: ${post.author}
Platform: ${post.platform}
${contextInfo.length > 0 ? '\nAdditional Context:\n' + contextInfo.map(info => `- ${info}`).join('\n') : ''}

Your task: Analyze this content in ANY language (English, German, French, etc.) and determine:
1. Content quality metrics (focus on originality and information value)
2. Emotional impact (constructive vs. manipulative)
3. User preference alignment (based on stated interests)
4. Content category classification
5. Content characteristics (original vs. reshared, substantive vs. superficial)
6. AI detection - Determine if the content appears to be AI-generated

Evaluate content for:
- Original thought/analysis vs. reposts/reshares
- Substantive information vs. small talk or personal anecdotes
- Technical/factual depth vs. surface-level discussion
- Educational value vs. self-promotion
- Novel insights vs. repetitive content
- Data-driven analysis vs. opinion without evidence
- Human authenticity vs. AI-generated patterns

IMPORTANT: If you detect AI-generated content with high confidence (>0.7), the originality score should be capped at 3/10 regardless of other factors. AI-generated content lacks the authentic human perspective and genuine insights we value.

CRITICAL CLASSIFICATION RULES:
- If content contains "Anzeige" (German) or "Sponsored" (English) labels → MUST classify as "advertisement"
- If posted by a company account promoting their products/services → "advertisement"  
- If individual sharing personal achievements → "promotion"
- If news organization reporting → "news" (even if mentioning products)
- Commercial product promotions and sponsored content → "advertisement"

PAY SPECIAL ATTENTION to platform signals in the context - if marked as sponsored/promoted, classify accordingly.

RESPONSE FORMAT: You MUST respond with ONLY a JSON object matching the exact structure shown above. Do not include any explanatory text before or after the JSON. The response must be valid, parseable JSON with all required fields.`;
    }
    async parseOllamaResponse(response) {
        try {
            const ratings = JSON.parse(response);
            // Calculate weighted overall score
            const weights = { contentQuality: 0.4, emotionalImpact: 0.3, userPreferences: 0.3 };
            const contentQualityValues = Object.values(ratings.contentQuality);
            const emotionalImpactValues = Object.values(ratings.emotionalImpact);
            const userPreferencesValues = Object.values(ratings.userPreferences);
            const contentScore = contentQualityValues.reduce((a, b) => a + b, 0) / contentQualityValues.length;
            const emotionalScore = emotionalImpactValues.reduce((a, b) => a + b, 0) / emotionalImpactValues.length;
            const preferenceScore = userPreferencesValues.reduce((a, b) => a + b, 0) / userPreferencesValues.length;
            const overallScore = Math.round((contentScore * weights.contentQuality +
                emotionalScore * weights.emotionalImpact +
                preferenceScore * weights.userPreferences) * 10);
            // Apply AI-generated penalty if detected with high confidence
            let finalScore = overallScore;
            if (ratings.isAIGenerated && ratings.aiConfidence > 0.7) {
                // Reduce score by 50% for AI-generated content
                finalScore = Math.round(overallScore * 0.5);
            }
            return {
                overallScore: Math.max(0, Math.min(100, finalScore)),
                contentQuality: ratings.contentQuality,
                emotionalImpact: ratings.emotionalImpact,
                userPreferences: ratings.userPreferences,
                contentType: ratings.contentType || { category: 'other', confidence: 0.5 },
                timestamp: Date.now(),
                isAIGenerated: ratings.isAIGenerated || false,
                aiConfidence: ratings.aiConfidence || 0
            };
        }
        catch (error) {
            console.error('Failed to parse Ollama response:', error);
            await _utils_error_logger__WEBPACK_IMPORTED_MODULE_0__.errorLogger.logError('ollama-service', 'parse-response', error, 'medium', {
                rawResponse: response.length > 1000 ? response.substring(0, 1000) + '...' : response
            });
            throw new Error('Invalid response format from Ollama');
        }
    }
    async testConnection() {
        return this.checkAvailability();
    }
}
const ollamaService = OllamaService.getInstance();


/***/ }),

/***/ "./src/utils/error-logger.ts":
/*!***********************************!*\
  !*** ./src/utils/error-logger.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ErrorLogger: () => (/* binding */ ErrorLogger),
/* harmony export */   errorLogger: () => (/* binding */ errorLogger)
/* harmony export */ });
class ErrorLogger {
    static instance;
    maxErrors = 100; // Maximum number of errors to store
    storageKey = 'extensionErrors';
    constructor() { }
    static getInstance() {
        if (!ErrorLogger.instance) {
            ErrorLogger.instance = new ErrorLogger();
        }
        return ErrorLogger.instance;
    }
    /**
     * Log an error with context information
     */
    async logError(component, operation, error, severity = 'medium', context) {
        try {
            const extensionError = {
                id: this.generateId(),
                timestamp: Date.now(),
                component,
                operation,
                severity,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                },
                context: {
                    ...context,
                    url: typeof window !== 'undefined' ? window.location.href : undefined,
                    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                    extensionVersion: chrome.runtime.getManifest().version
                }
            };
            await this.storeError(extensionError);
            // Also log to console for immediate debugging
            console.error(`[${component}] ${operation}:`, error, context);
        }
        catch (storageError) {
            // Fallback: at least log to console if storage fails
            console.error('Failed to store error log:', storageError);
            console.error(`[${component}] ${operation}:`, error, context);
        }
    }
    /**
     * Log a simple message as an error
     */
    async logMessage(component, operation, message, severity = 'medium', context) {
        const error = new Error(message);
        await this.logError(component, operation, error, severity, context);
    }
    /**
     * Get all stored errors
     */
    async getErrors() {
        try {
            const result = await chrome.storage.local.get(this.storageKey);
            return result[this.storageKey] || [];
        }
        catch (error) {
            console.error('Failed to retrieve error logs:', error);
            return [];
        }
    }
    /**
     * Get errors filtered by component
     */
    async getErrorsByComponent(component) {
        const errors = await this.getErrors();
        return errors.filter(err => err.component === component);
    }
    /**
     * Get errors filtered by severity
     */
    async getErrorsBySeverity(severity) {
        const errors = await this.getErrors();
        return errors.filter(err => err.severity === severity);
    }
    /**
     * Clear all stored errors
     */
    async clearErrors() {
        try {
            await chrome.storage.local.remove(this.storageKey);
        }
        catch (error) {
            console.error('Failed to clear error logs:', error);
        }
    }
    /**
     * Clear errors older than specified days
     */
    async clearOldErrors(daysOld = 7) {
        try {
            const errors = await this.getErrors();
            const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
            const recentErrors = errors.filter(err => err.timestamp > cutoffTime);
            await chrome.storage.local.set({ [this.storageKey]: recentErrors });
        }
        catch (error) {
            console.error('Failed to clear old error logs:', error);
        }
    }
    /**
     * Get error statistics
     */
    async getErrorStats() {
        const errors = await this.getErrors();
        const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
        const stats = {
            total: errors.length,
            byComponent: {},
            bySeverity: {},
            last24Hours: errors.filter(err => err.timestamp > last24Hours).length
        };
        errors.forEach(err => {
            stats.byComponent[err.component] = (stats.byComponent[err.component] || 0) + 1;
            stats.bySeverity[err.severity] = (stats.bySeverity[err.severity] || 0) + 1;
        });
        return stats;
    }
    /**
     * Store error in Chrome storage
     */
    async storeError(error) {
        const errors = await this.getErrors();
        errors.unshift(error); // Add to beginning of array (most recent first)
        // Keep only the most recent errors
        if (errors.length > this.maxErrors) {
            errors.splice(this.maxErrors);
        }
        await chrome.storage.local.set({ [this.storageKey]: errors });
    }
    /**
     * Generate a unique ID for the error
     */
    generateId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Wrap a function to automatically log errors
     */
    wrapAsync(component, operation, fn) {
        return async (...args) => {
            try {
                return await fn(...args);
            }
            catch (error) {
                await this.logError(component, operation, error, 'high', { args });
                throw error; // Re-throw to maintain original behavior
            }
        };
    }
    /**
     * Wrap a synchronous function to automatically log errors
     */
    wrapSync(component, operation, fn) {
        return (...args) => {
            try {
                return fn(...args);
            }
            catch (error) {
                // Use setTimeout to avoid blocking synchronous execution
                setTimeout(() => {
                    this.logError(component, operation, error, 'high', { args });
                }, 0);
                throw error; // Re-throw to maintain original behavior
            }
        };
    }
}
// Export a singleton instance
const errorLogger = ErrorLogger.getInstance();
// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        errorLogger.logError('global', 'unhandled-error', event.error || new Error(event.message), 'critical', {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    });
    window.addEventListener('unhandledrejection', (event) => {
        errorLogger.logError('global', 'unhandled-promise-rejection', event.reason instanceof Error ? event.reason : new Error(String(event.reason)), 'critical');
    });
}


/***/ }),

/***/ "?8893":
/*!************************!*\
  !*** crypto (ignored) ***!
  \************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?5041":
/*!********************!*\
  !*** fs (ignored) ***!
  \********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?c8d5":
/*!**********************!*\
  !*** path (ignored) ***!
  \**********************/
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!*********************************!*\
  !*** ./src/background/index.ts ***!
  \*********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _database_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./database-service */ "./src/background/database-service.ts");
/* harmony import */ var _ollama_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ollama-service */ "./src/background/ollama-service.ts");


// Check if we're in development mode
const isDevelopmentMode = () => {
    // Check for development flag in storage or use manifest version check
    return true; // For now, always enable development mode for testing
};
// Clean expired entries from cache
async function cleanupCache() {
    try {
        const { cachedRatings } = await chrome.storage.local.get('cachedRatings');
        if (!cachedRatings)
            return;
        const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
        const now = Date.now();
        let cleanedCount = 0;
        for (const [postId, rating] of Object.entries(cachedRatings)) {
            if (now - rating.timestamp > CACHE_EXPIRY) {
                delete cachedRatings[postId];
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            await chrome.storage.local.set({ cachedRatings });
            console.log(`Startup cache cleanup: removed ${cleanedCount} expired entries`);
        }
    }
    catch (error) {
        console.error('Failed to cleanup cache:', error);
    }
}
// Initialize default settings
async function initializeStorage() {
    const defaultSettings = {
        settings: {
            autoHideThreshold: 20,
            dimThreshold: 40,
            highlightThreshold: 80,
            weights: {
                contentQuality: 0.4,
                emotionalImpact: 0.3,
                userPreferences: 0.3
            },
            defaultViewMode: 'condensed', // Default to condensed view
            userPrompt: '', // Empty by default, user can customize
            interestKeywords: [], // Empty by default
            avoidKeywords: [], // Empty by default
            preferOriginalContent: true // Default to preferring original content
        },
        modelSettings: {
            modelPath: 'models/default.gguf',
            modelType: 'default',
            inferenceSettings: {
                maxTokens: 100,
                temperature: 0.7,
                topP: 0.9,
                contextLength: 2048 // Default context length
            },
            backend: 'ollama', // Default to Ollama
            ollamaModel: 'llama3.2' // Default Ollama model
        },
        cachedRatings: {},
        userFeedback: {},
        isInitialized: false, // Track if extension has been set up
        analytics: {
            enableFeedAnalytics: true, // Default enabled
            linkedinOnly: true,
            maxStoredPosts: 10000
        }
    };
    try {
        // Get existing storage data
        const storage = await chrome.storage.local.get('settings');
        // In development mode, always initialize the service
        if (isDevelopmentMode()) {
            console.log('Development mode: Bypassing setup requirement');
            // Use existing settings or defaults
            const settings = storage.settings || defaultSettings;
            // Mark as initialized for development
            settings.isInitialized = true;
            // Save settings
            await chrome.storage.local.set({ settings });
            // Clean cache on startup
            await cleanupCache();
            // Initialize database service for analytics
            await initializeDatabaseService();
            // Check Ollama availability on startup
            await _ollama_service__WEBPACK_IMPORTED_MODULE_1__.ollamaService.checkAvailability();
            console.log('Development mode: Service initialized successfully');
            return;
        }
        // Production mode: check if setup is needed
        if (!storage.settings || !storage.settings.isInitialized) {
            await chrome.storage.local.set({ settings: defaultSettings });
            // Open setup page
            await showSetupPage();
            return;
        }
        // If already initialized, proceed with normal startup
        await cleanupCache();
        await initializeDatabaseService();
        await _ollama_service__WEBPACK_IMPORTED_MODULE_1__.ollamaService.checkAvailability();
    }
    catch (error) {
        console.error('Failed to initialize storage:', error);
        // In development mode, try to continue with defaults
        if (isDevelopmentMode()) {
            console.log('Development mode: Using default settings after error');
            defaultSettings.isInitialized = true;
            await chrome.storage.local.set({ settings: defaultSettings });
        }
        else {
            await showSetupPage();
        }
    }
}
// Show the setup page
async function showSetupPage() {
    // Create setup tab
    const setupUrl = chrome.runtime.getURL('options.html?setup=true');
    await chrome.tabs.create({ url: setupUrl });
}
// Initialize database service for feed analytics
async function initializeDatabaseService() {
    try {
        console.log('Initializing database service for feed analytics...');
        await _database_service__WEBPACK_IMPORTED_MODULE_0__.databaseService.initialize();
        console.log('Database service initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize database service:', error);
        // Analytics are optional, so we don't block extension startup
    }
}
// Create a fallback rating when Llama service fails
function createFallbackRating() {
    // Generate more realistic varied ratings for development/fallback mode
    const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    // Generate individual scores with some correlation
    const baseQuality = randomRange(3, 8);
    const contentQuality = {
        writingQuality: Math.max(1, Math.min(10, baseQuality + randomRange(-2, 2))),
        informationDensity: Math.max(1, Math.min(10, baseQuality + randomRange(-2, 2))),
        sourceCredibility: Math.max(1, Math.min(10, baseQuality + randomRange(-1, 2))),
        originality: Math.max(1, Math.min(10, baseQuality + randomRange(-3, 1)))
    };
    const emotionalBase = randomRange(4, 7);
    const emotionalImpact = {
        toxicityLevel: Math.max(1, Math.min(10, emotionalBase + randomRange(-2, 2))),
        emotionalManipulation: Math.max(1, Math.min(10, emotionalBase + randomRange(-1, 2))),
        socialHarmony: Math.max(1, Math.min(10, emotionalBase + randomRange(-1, 3)))
    };
    const preferenceBase = randomRange(3, 8);
    const userPreferences = {
        topicAlignment: Math.max(1, Math.min(10, preferenceBase + randomRange(-2, 2))),
        sourcePreference: Math.max(1, Math.min(10, preferenceBase + randomRange(-1, 2))),
        historicalInteraction: Math.max(1, Math.min(10, preferenceBase + randomRange(-2, 1)))
    };
    // Calculate weighted overall score
    const weights = { contentQuality: 0.4, emotionalImpact: 0.3, userPreferences: 0.3 };
    const contentScore = Object.values(contentQuality).reduce((a, b) => a + b, 0) / 4;
    const emotionalScore = Object.values(emotionalImpact).reduce((a, b) => a + b, 0) / 3;
    const preferenceScore = Object.values(userPreferences).reduce((a, b) => a + b, 0) / 3;
    const overallScore = Math.round((contentScore * weights.contentQuality +
        emotionalScore * weights.emotionalImpact +
        preferenceScore * weights.userPreferences) * 10);
    // Generate random content classification
    const categories = ['personal', 'business', 'tech', 'finance', 'news', 'entertainment', 'education', 'advertisement', 'promotion', 'politics', 'other'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    return {
        overallScore: Math.max(20, Math.min(90, overallScore)), // Clamp between 20-90
        contentQuality,
        emotionalImpact,
        userPreferences,
        contentType: {
            category,
            confidence: Math.random() * 0.3 + 0.7 // 0.7 to 1.0 confidence
        },
        timestamp: Date.now(),
        isAIGenerated: Math.random() < 0.2, // 20% chance of being AI-generated in fallback
        aiConfidence: Math.random() * 0.5 + 0.3 // 0.3 to 0.8 confidence
    };
}
// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'REQUEST_RATING') {
        console.log('REQUEST_RATING received:', {
            postId: message.post?.id,
            platform: message.post?.platform,
            contentLength: message.post?.content?.length
        });
        if (!message.post) {
            console.error('No post data provided');
            sendResponse({ rating: createFallbackRating().overallScore, fallback: true, error: 'No post data' });
            return true;
        }
        const post = message.post;
        // Handle the rating request asynchronously with proper error boundaries
        (async () => {
            try {
                // Get storage data
                const result = await chrome.storage.local.get(['cachedRatings', 'settings']);
                const cachedRatings = result.cachedRatings || {};
                const settings = result.settings;
                console.log('Storage check:', {
                    hasSettings: !!settings,
                    isInitialized: settings?.isInitialized,
                    isDev: isDevelopmentMode(),
                    hasCachedRating: !!cachedRatings[post.id]
                });
                // In development mode or if initialized, proceed with analysis
                if (!settings?.isInitialized && !isDevelopmentMode()) {
                    console.log('Extension not initialized and not in development mode');
                    sendResponse({ rating: createFallbackRating().overallScore, fallback: true, reason: 'not_initialized' });
                    return;
                }
                // Check cache first with expiration check
                if (cachedRatings[post.id]) {
                    const cachedRating = cachedRatings[post.id];
                    const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
                    const isExpired = Date.now() - cachedRating.timestamp > CACHE_EXPIRY;
                    if (!isExpired) {
                        console.log('Returning cached rating for post:', post.id);
                        sendResponse({
                            rating: cachedRating.overallScore,
                            contentType: cachedRating.contentType,
                            debugInfo: cachedRating.debugInfo,
                            isAIGenerated: cachedRating.isAIGenerated,
                            aiConfidence: cachedRating.aiConfidence,
                            cached: true
                        });
                        return;
                    }
                    else {
                        console.log('Cached rating expired for post:', post.id);
                        delete cachedRatings[post.id];
                    }
                }
                // Generate new rating
                console.log('Generating new rating for post:', post.id);
                try {
                    let rating;
                    // Check if Ollama is available
                    if (_ollama_service__WEBPACK_IMPORTED_MODULE_1__.ollamaService.isOllamaAvailable()) {
                        console.log('Using Ollama for content analysis');
                        const modelName = settings?.modelSettings?.ollamaModel || 'llama3.2';
                        // Add timeout to prevent hanging requests
                        const analysisPromise = _ollama_service__WEBPACK_IMPORTED_MODULE_1__.ollamaService.analyzeContent(post, modelName, settings?.settings);
                        const timeoutPromise = new Promise((_, reject) => {
                            setTimeout(() => reject(new Error('Ollama request timeout')), 30000); // 30 second timeout
                        });
                        rating = await Promise.race([analysisPromise, timeoutPromise]);
                    }
                    else {
                        throw new Error('Ollama is not available. Please ensure Ollama is running.');
                    }
                    console.log('Rating generated:', {
                        postId: post.id,
                        overallScore: rating.overallScore,
                        timestamp: rating.timestamp
                    });
                    // Cache the rating with size limit
                    cachedRatings[post.id] = rating;
                    // Implement cache size limit (1000 entries max)
                    const cacheKeys = Object.keys(cachedRatings);
                    const MAX_CACHE_SIZE = 1000;
                    if (cacheKeys.length > MAX_CACHE_SIZE) {
                        // Remove oldest entries (by timestamp)
                        const sortedKeys = cacheKeys.sort((a, b) => cachedRatings[a].timestamp - cachedRatings[b].timestamp);
                        const keysToRemove = sortedKeys.slice(0, cacheKeys.length - MAX_CACHE_SIZE);
                        keysToRemove.forEach(key => delete cachedRatings[key]);
                        console.log(`Cleaned cache: removed ${keysToRemove.length} old entries`);
                    }
                    await chrome.storage.local.set({ cachedRatings });
                    sendResponse({
                        rating: rating.overallScore,
                        contentType: rating.contentType,
                        debugInfo: rating.debugInfo,
                        isAIGenerated: rating.isAIGenerated,
                        aiConfidence: rating.aiConfidence
                    });
                }
                catch (error) {
                    console.error('Error analyzing content:', error);
                    // Use fallback rating and still cache it
                    const fallbackRating = createFallbackRating();
                    console.log('Using fallback rating due to error:', error instanceof Error ? error.message : String(error));
                    // Cache the fallback rating too so stats are updated
                    cachedRatings[post.id] = fallbackRating;
                    try {
                        await chrome.storage.local.set({ cachedRatings });
                    }
                    catch (storageError) {
                        console.error('Failed to save fallback rating to cache:', storageError);
                    }
                    sendResponse({
                        rating: fallbackRating.overallScore,
                        contentType: fallbackRating.contentType,
                        isAIGenerated: fallbackRating.isAIGenerated,
                        aiConfidence: fallbackRating.aiConfidence,
                        fallback: true,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }
            catch (outerError) {
                console.error('Critical error in REQUEST_RATING handler:', outerError);
                // Ensure we always send a response
                sendResponse({
                    rating: createFallbackRating().overallScore,
                    fallback: true,
                    error: outerError instanceof Error ? outerError.message : String(outerError)
                });
            }
        })().catch((asyncError) => {
            // Final safety net for any unhandled promise rejections
            console.error('Unhandled async error in REQUEST_RATING:', asyncError);
            sendResponse({
                rating: createFallbackRating().overallScore,
                fallback: true,
                error: 'Unhandled async error'
            });
        });
        return true;
    }
    // Handle setup completion
    if (message.type === 'SETUP_COMPLETE') {
        console.log('Setup completed successfully');
        return true;
    }
    // Handle feed analytics messages
    if (message.type === 'FEED_ITEM_DETECTED') {
        (async () => {
            try {
                console.log('🔍 FEED_ITEM_DETECTED received:', {
                    id: message.data?.id,
                    author: message.data?.author?.name,
                    contentLength: message.data?.content?.length,
                    postType: message.data?.postType,
                    timestamp: new Date().toISOString()
                });
                // Check if analytics are enabled
                const { settings } = await chrome.storage.local.get('settings');
                const analyticsEnabled = settings?.analytics?.enableFeedAnalytics ?? true;
                if (!analyticsEnabled) {
                    sendResponse({ success: false, error: 'Analytics disabled' });
                    return;
                }
                // Enhance feed data with AI analysis
                let enhancedFeedData = { ...message.data };
                try {
                    // Create a Post object for AI analysis
                    const post = {
                        id: message.data.id,
                        platform: 'linkedin',
                        content: message.data.content,
                        author: message.data.author.name,
                        timestamp: Date.now(),
                        contextualInfo: {
                            authorProfile: message.data.author.headline,
                            postType: message.data.postType,
                            hasMedia: message.data.hasMedia,
                            hasLinks: false // Could be enhanced
                        }
                    };
                    // Get AI analysis if Ollama is available
                    if (_ollama_service__WEBPACK_IMPORTED_MODULE_1__.ollamaService.isOllamaAvailable()) {
                        console.log('Getting AI analysis for feed item:', message.data.id);
                        const modelName = settings?.modelSettings?.ollamaModel || 'llama3.2';
                        // Add timeout for AI analysis
                        const analysisPromise = _ollama_service__WEBPACK_IMPORTED_MODULE_1__.ollamaService.analyzeContent(post, modelName, settings?.settings);
                        const timeoutPromise = new Promise((_, reject) => {
                            setTimeout(() => reject(new Error('AI analysis timeout')), 15000); // 15 second timeout
                        });
                        const rating = await Promise.race([analysisPromise, timeoutPromise]);
                        // Add AI analysis to feed data
                        enhancedFeedData.overallScore = rating.overallScore;
                        enhancedFeedData.contentCategory = rating.contentType?.category;
                        enhancedFeedData.categoryConfidence = rating.contentType?.confidence;
                        enhancedFeedData.contentQualityScore = Object.values(rating.contentQuality).reduce((a, b) => a + b, 0) / 4;
                        enhancedFeedData.emotionalImpactScore = Object.values(rating.emotionalImpact).reduce((a, b) => a + b, 0) / 3;
                        enhancedFeedData.userPreferenceScore = Object.values(rating.userPreferences).reduce((a, b) => a + b, 0) / 3;
                        enhancedFeedData.isAIGenerated = rating.isAIGenerated;
                        enhancedFeedData.aiConfidence = rating.aiConfidence;
                        console.log('AI analysis completed for feed item:', {
                            id: message.data.id,
                            score: rating.overallScore,
                            category: rating.contentType?.category
                        });
                    }
                    else {
                        console.log('Ollama not available, storing feed item without AI analysis');
                    }
                }
                catch (aiError) {
                    console.warn('AI analysis failed for feed item, storing without analysis:', aiError);
                    // Continue without AI analysis - we still want to store the basic feed data
                }
                // Store the feed item (with or without AI analysis)
                console.log('📊 Storing feed item in database:', {
                    id: enhancedFeedData.id,
                    hasAIAnalysis: !!enhancedFeedData.overallScore,
                    score: enhancedFeedData.overallScore,
                    category: enhancedFeedData.contentCategory
                });
                const result = await _database_service__WEBPACK_IMPORTED_MODULE_0__.databaseService.processFeedItem(enhancedFeedData);
                console.log('✅ Feed item stored successfully:', result);
                // Verify storage by getting recent statistics
                try {
                    const stats = await _database_service__WEBPACK_IMPORTED_MODULE_0__.databaseService.getStatistics();
                    console.log('📈 Current database stats after insert:', {
                        totalPosts: stats.totalPosts,
                        uniqueAuthors: stats.uniqueAuthors,
                        lastUpdate: new Date().toISOString()
                    });
                }
                catch (statsError) {
                    console.error('⚠️ Could not get stats after insert:', statsError);
                }
                sendResponse({ success: true, result });
            }
            catch (error) {
                console.error('Error storing feed item:', error);
                sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
            }
        })();
        return true;
    }
    if (message.type === 'GET_STATISTICS') {
        (async () => {
            try {
                const stats = await _database_service__WEBPACK_IMPORTED_MODULE_0__.databaseService.getStatistics();
                sendResponse({ success: true, stats });
            }
            catch (error) {
                console.error('Error getting statistics:', error);
                sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
            }
        })();
        return true;
    }
    if (message.type === 'CHECK_OLLAMA') {
        (async () => {
            try {
                const isAvailable = await _ollama_service__WEBPACK_IMPORTED_MODULE_1__.ollamaService.checkAvailability();
                const models = _ollama_service__WEBPACK_IMPORTED_MODULE_1__.ollamaService.getAvailableModels();
                sendResponse({
                    success: true,
                    available: isAvailable,
                    models: models
                });
            }
            catch (error) {
                console.error('Error checking Ollama:', error);
                sendResponse({
                    success: false,
                    available: false,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        })();
        return true;
    }
    if (message.type === 'USER_FEEDBACK') {
        console.log('USER_FEEDBACK received:', {
            postId: message.postId,
            feedback: message.feedback
        });
        (async () => {
            try {
                // Store user feedback in chrome.storage for learning
                const result = await chrome.storage.local.get('userFeedback');
                const feedback = result.userFeedback || {};
                if (message.postId) {
                    if (message.feedback === null) {
                        // Remove feedback if null
                        delete feedback[message.postId];
                    }
                    else {
                        // Store feedback with timestamp
                        feedback[message.postId] = {
                            feedback: message.feedback,
                            timestamp: message.timestamp || Date.now()
                        };
                    }
                }
                await chrome.storage.local.set({ userFeedback: feedback });
                console.log(`User feedback stored for post ${message.postId}: ${message.feedback}`);
                sendResponse({ success: true });
            }
            catch (error) {
                console.error('Error storing user feedback:', error);
                sendResponse({
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        })();
        return true;
    }
    // Handle BLOCK_CONTENT message
    if (message.type === 'BLOCK_CONTENT') {
        console.log('Content blocked by user:', message.post?.id);
        // Could store blocked content for analytics
        sendResponse({ success: true });
        return false; // Synchronous response
    }
    // Handle UPDATE_ICON_STATE message
    if (message.type === 'UPDATE_ICON_STATE') {
        // Could update extension icon based on active state
        console.log('Icon state update:', message.active ? 'active' : 'inactive');
        sendResponse({ success: true });
        return false; // Synchronous response
    }
    // Handle OPEN_OPTIONS message
    if (message.type === 'OPEN_OPTIONS') {
        chrome.runtime.openOptionsPage();
        sendResponse({ success: true });
        return false; // Synchronous response
    }
    // Test Analytics with Sample Data
    if (message.type === 'TEST_ANALYTICS_INSERT') {
        (async () => {
            try {
                console.log('🧪 TEST_ANALYTICS_INSERT: Creating sample feed item...');
                const sampleFeedItem = {
                    id: `test-${Date.now()}`,
                    author: {
                        id: 'test-author-1',
                        name: 'Test Author',
                        headline: 'Test Headline for Debug',
                        profileUrl: 'https://linkedin.com/in/test-author',
                        verified: false
                    },
                    content: 'This is a test post created for debugging analytics. It should appear in the analytics dashboard.',
                    postType: 'post',
                    reactionCount: 5,
                    commentCount: 2,
                    repostCount: 1,
                    reactionTypes: ['like', 'celebrate'],
                    hasMedia: false,
                    timestamp: new Date().toISOString(),
                    // Add AI analysis data for testing
                    overallScore: 75,
                    contentCategory: 'business',
                    categoryConfidence: 0.85,
                    contentQualityScore: 7.5,
                    emotionalImpactScore: 6.2,
                    userPreferenceScore: 8.1,
                    isAIGenerated: false,
                    aiConfidence: 0.1
                };
                const result = await _database_service__WEBPACK_IMPORTED_MODULE_0__.databaseService.processFeedItem(sampleFeedItem);
                console.log('🧪 Test feed item processed:', result);
                // Get updated stats
                const stats = await _database_service__WEBPACK_IMPORTED_MODULE_0__.databaseService.getStatistics();
                console.log('🧪 Updated stats after test insert:', stats);
                sendResponse({ success: true, result, stats });
            }
            catch (error) {
                console.error('🧪 TEST_ANALYTICS_INSERT error:', error);
                sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
            }
        })();
        return true;
    }
    // Reset Database (for debugging)
    if (message.type === 'RESET_DATABASE') {
        (async () => {
            try {
                console.log('🔧 RESET_DATABASE: Clearing database...');
                // Clear Chrome storage
                await chrome.storage.local.remove(['feedDatabase', 'processedPostIds']);
                // Reinitialize database
                await _database_service__WEBPACK_IMPORTED_MODULE_0__.databaseService.initialize();
                // Get new stats
                const stats = await _database_service__WEBPACK_IMPORTED_MODULE_0__.databaseService.getStatistics();
                console.log('🔧 Database reset complete. New stats:', stats);
                sendResponse({ success: true, stats });
            }
            catch (error) {
                console.error('🔧 RESET_DATABASE error:', error);
                sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
            }
        })();
        return true;
    }
    // Debug Analytics Flow
    if (message.type === 'DEBUG_ANALYTICS') {
        (async () => {
            try {
                const debugInfo = {
                    timestamp: new Date().toISOString(),
                    databaseStatus: 'unknown',
                    tableInfo: [],
                    recentInserts: [],
                    storageInfo: {},
                    feedProcessingStats: {}
                };
                // Test database connection
                try {
                    await _database_service__WEBPACK_IMPORTED_MODULE_0__.databaseService.initialize();
                    debugInfo.databaseStatus = 'initialized';
                    // Get table info
                    const tables = await _database_service__WEBPACK_IMPORTED_MODULE_0__.databaseService.getDebugInfo();
                    debugInfo.tableInfo = tables;
                    console.log('DEBUG_ANALYTICS: Database tables:', tables);
                }
                catch (dbError) {
                    debugInfo.databaseStatus = `error: ${dbError instanceof Error ? dbError.message : String(dbError)}`;
                    console.error('DEBUG_ANALYTICS: Database error:', dbError);
                }
                // Check Chrome storage
                try {
                    const storage = await chrome.storage.local.get(['feedDatabase', 'processedPostIds', 'settings']);
                    debugInfo.storageInfo = {
                        hasFeedDatabase: !!storage.feedDatabase,
                        feedDatabaseSize: storage.feedDatabase ? storage.feedDatabase.length : 0,
                        processedPostsCount: storage.processedPostIds ? storage.processedPostIds.length : 0,
                        analyticsEnabled: storage.settings?.analytics?.enableFeedAnalytics ?? 'unknown'
                    };
                    console.log('DEBUG_ANALYTICS: Storage info:', debugInfo.storageInfo);
                }
                catch (storageError) {
                    console.error('DEBUG_ANALYTICS: Storage error:', storageError);
                }
                sendResponse({ success: true, debugInfo });
            }
            catch (error) {
                console.error('DEBUG_ANALYTICS error:', error);
                sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
            }
        })();
        return true;
    }
    return true;
});
// Initialize when installed
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed, initializing...');
    initializeStorage();
});
// Initialize on startup (for development reloads)
chrome.runtime.onStartup.addListener(() => {
    console.log('Extension started, initializing...');
    initializeStorage();
});
// Initialize immediately when the background script loads
// This ensures the service is ready even after manual reloads during development
console.log('Background script loaded, initializing...');
initializeStorage();

})();

/******/ })()
;
//# sourceMappingURL=background.js.map