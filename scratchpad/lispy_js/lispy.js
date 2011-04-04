String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); };

// конструктор структуры, представляющей контекст исполнения
function Env(outerEnv, params, args) {
  this._map = {}; // symbol -> cell
  this._outerEnv = outerEnv;
  // params - параметры функции (задаются при определении функции)
  // args - аргументы (передаются при реальном вызове этой функции)
  if (params && args) { // число элементов должно совпадать
    for (var i = 0; i < params.length; i++) {
      this._map[params[i].val] = args[i];
    }
  }
  this.findEnv = function (s) {
    if (s in this._map)
      return this;
    if (this._outerEnv)
      return this._outerEnv.findEnv(s);
    throw "Unbound symbol " + s;
  }
  this.findCell = function (s) {
    if (s in this._map)
      return this._map[s];
    else
      return null;
  }
  this.add = function (s, cell) {
    this._map[s] = cell;
  }
}

// конструкторы встроенных типов
function Cell(type, val) {
  this.type = type;
  this.val = val;
  this.list = [];
  this.proc = null;
  this.env = null;
}

function Proc(f) {
  var p = new Cell('Proc', '');
  p.proc = f;
  return p;
}

function Atom(token) {
  if (token[0] == '"'
      && token[token.length - 1] == '"') {
    return new Cell('String', token.substring(1, token.length - 1));
  }
  else if (!isNaN(parseInt(token[0]))) {
    return new Cell('Number', token);
  }
  else {
    return new Cell('Symbol', token);
  }
}

function List() {
  return new Cell('List', '');
}

// встроенные функции
function proc_add(cl) { // cl == cell list, ожидает список cell с типом Number
  var r = parseInt(cl[0].val);
  for (var i = 1; i < cl.length; i++) {
    r = r +  parseInt(cl[i].val);
  }
  return new Atom(r.toString());
}

function proc_sub(cl) { // cl == cell list, ожидает список cell с типом Number
  var r = parseInt(cl[0].val);
  for (var i = 1; i < cl.length; i++) {
    r = r -  parseInt(cl[i].val);
  }
  return new Atom(r.toString());
}

function proc_mul(cl) {
  var r = parseInt(cl[0].val);
  for (var i = 1; i < cl.length; i++) {
    r = r *  parseInt(cl[i].val);
  }
  return new Atom(r.toString());
}

function proc_div(cl) {
  var r = parseInt(cl[0].val);
  for (var i = 1; i < cl.length; i++) {
    r = r / parseInt(cl[i].val);
  }
  return new Atom(r.toString());
}

function proc_less(cl) {
  var n = parseInt(cl[0].val);
  for (var i = 1; i < cl.length; i++) {
    if (n >= parseInt(cl[i].val))
      return false_sym;
  }
  return true_sym;
}

function proc_less_equal(cl) {
  var n = parseInt(cl[0].val);
  for (var i = 1; i < cl.length; i++) {
    if (n > parseInt(cl[i].val))
      return false_sym;
  }
  return true_sym;
}

function proc_greater(cl) {
  var n = parseInt(cl[0].val);
  for (var i = 1; i < cl.length; i++) {
    if (n <= parseInt(cl[i].val))
      return false_sym;
  }
  return true_sym;
}

function proc_str_equal(cl) {
  var s = cl[0].val;
  for (var i = 1; i < cl.length; i++) {
    if (s != cl[i].val)
      return false_sym;
  }
  return true_sym;
}

function proc_str_concat(cl) {
  var s = cl[0].val;
  for (var i = 1; i < cl.length; i++) {
    s = s + cl[i].val;
  }
  return new Cell('String', s);
}

function proc_DOMSETVAL(cl) {
  var id = cl[0].val;
  var newval = cl[1].val;
  $('#' + id).val(newval);
  return true_sym;
}

function proc_SHOW(cl) {
  for (var i = 0; i < cl.length; i++) {
    $('#' + cl[i].val).show();
  }
  return true_sym;
}

function proc_HIDE(cl) {
  for (var i = 0; i < cl.length; i++) {
    $('#' + cl[i].val).hide();
  }
  return true_sym;
}

function proc_MANDATORY(cl) {
  for (var i = 0; i < cl.length; i++) {
    //todo : установить признак обязательности
    // $('#' + cl[i].val).hide();
  }
  return true_sym;
}

function proc_REQ_EQUALS(cl) {
  var req_name = cl[0].val;
  var req_cmp_val = cl[1].val; 
  // todo : реализовать сравнение реквизита, возможно, определить его тип
  return ($('#' + req_name).val() == req_cmp_val) ? true_sym : false_sym;
}

function proc_REQ_LESS(cl) {
  var req_name = cl[0].val;
  var req_cmp_val = cl[1].val; 
  // todo : реализовать сравнение реквизита, возможно, определить его тип
  return ($('#' + req_name).val() < req_cmp_val) ? true_sym : false_sym;
}

function proc_REQ_GREATER(cl) {
  var req_name = cl[0].val;
  var req_cmp_val = cl[1].val; 
  // todo : реализовать сравнение реквизита, возможно, определить его тип
  return ($('#' + req_name).val() > req_cmp_val) ? true_sym : false_sym;
}

function proc_REQ_LESS_OR_EQUALS(cl) {
  var req_name = cl[0].val;
  var req_cmp_val = cl[1].val; 
  // todo : реализовать сравнение реквизита, возможно, определить его тип
  return ($('#' + req_name).val() <= req_cmp_val) ? true_sym : false_sym;
}

function proc_REQ_GREATER_OR_EQUALS(cl) {
  var req_name = cl[0].val;
  var req_cmp_val = cl[1].val; 
  // todo : реализовать сравнение реквизита, возможно, определить его тип
  return ($('#' + req_name).val() >= req_cmp_val) ? true_sym : false_sym;
}

// глобальные символы
nil = new Atom('nil');
true_sym = new Atom('#t');
false_sym = new Atom('#f');

// глобальная env и предзаданные в ней символы
global_env = new Env(null, null, null);
global_env.add('nil', nil);
global_env.add('#t', true_sym);
global_env.add('#f', false_sym);
global_env.add('+', new Proc(proc_add));
global_env.add('-', new Proc(proc_sub));
global_env.add('*', new Proc(proc_mul));
global_env.add('/', new Proc(proc_div));
global_env.add('<', new Proc(proc_less));
global_env.add('>', new Proc(proc_greater));
global_env.add('<=', new Proc(proc_less_equal));
global_env.add('s=', new Proc(proc_str_equal));
global_env.add('s+', new Proc(proc_str_concat));
global_env.add('DOMSETVAL', new Proc(proc_DOMSETVAL));
global_env.add('SHOW', new Proc(proc_SHOW));
global_env.add('HIDE', new Proc(proc_HIDE));
global_env.add('MANDATORY', new Proc(proc_MANDATORY));
global_env.add('REQ=', new Proc(proc_REQ_EQUALS));
global_env.add('REQ<', new Proc(proc_REQ_LESS));
global_env.add('REQ>', new Proc(proc_REQ_GREATER));
global_env.add('REQ<=', new Proc(proc_REQ_LESS_OR_EQUALS));
global_env.add('REQ>=', new Proc(proc_REQ_GREATER_OR_EQUALS));

// лексический анализатор. todo : надо бы сделать, чтоб поддерживал пробелы
// в строках
function tokenize(s) {
  var res = [];
  s = s.replace(/\(/g, " ( ");
  s = s.replace(/\)/g, " ) ");
  var tks = s.split(" ");
  for (var i = 0; i < tks.length; i++) {
    token = tks[i].trim();
    if (token != '')
      res.push(token);
  }
  return res;
}

// Синтаксический анализатор
// Возвращает дерево синтаксического разбора из списка токенов.
// "Тип" возвращаемого значения - Cell
// в примере называется read_from
// getAST(tokenize('(+ 2 ( * 5 7))'))
function getAST(tokens) {
  var token = tokens[0];
  tokens.shift(); // pop_front
  if (token == '(') {
    var c = new List();
    while (tokens[0] != ')') {
      c.list.push(getAST(tokens));
    }
    tokens.shift();
    return c;
  }
  else {
    return new Atom(token);
  }
}

// интерпретатор
function _eval(cell, env) {
  if (cell.type == "Symbol")
    return env.findEnv(cell.val).findCell(cell.val);
  if (cell.type == "Number")
    return cell;
  if (cell.type == "String")
    return cell;
  // nil и пустой список в Scheme эквивалентны
  if (cell.list.length == 0)
    return nil;
  if (cell.list[0].type == "Symbol") {
    // тут встроенные формы
    if (cell.list[0].val == 'quote')
      return cell.list[1];
    if (cell.list[0].val == 'if') { // if test conseq alt
      var test_res = _eval(cell.list[1], env).val;
      if (test_res == '#t')
        return _eval(cell.list[2], env);
      else {
        if (cell.list[3])
          return _eval(cell.list[3], env);
        else
          return nil;
      }
    }
    if (cell.list[0].val == 'define') {
      if (! env.findCell(cell.list[1].val) ) {
        env.add(cell.list[1].val, _eval(cell.list[2], env));
      }
      else {
        env._map[cell.list[1].val] = _eval(cell.list[2], env);
      }
      return env.findCell(cell.list[1].val);
    }
    if (cell.list[0].val == 'set!') {
      // символ должен быть уже определен ранее через define
      return env.findEnv(cell.list[1].val)._map[cell.list[1].val]
         = _eval(cell.list[2], env);
    }
    if (cell.list[0].val == 'begin') {
      // вычислить все, кроме последней cell
      for (var i = 1; i < cell.list.length - 1; i++) {
        _eval(cell.list[i], env);
      }
      // вычислить и вернуть последнюю cell
      return _eval(cell.list[cell.list.length - 1], env);
    }
    if (cell.list[0].val == 'and') {
      var r = true_sym;
      for (var i = 1; i < cell.list.length; i++) {
        r = _eval(cell.list[i], env);
        if (r == false_sym)
          return r;
      }
      return r;
    }
    if (cell.list[0].val == 'or') {
      var r = false_sym;
      for (var i = 1; i < cell.list.length; i++) {
        r = _eval(cell.list[i], env);
        if (r == true_sym)
          return r;
      }
      return r;
    }
    if (cell.list[0].val == 'lambda') {
      cell.type = 'Lambda';
      cell.env = env;
      return cell;
    }
  }
  // если дошли сюда, значит функция (встроенная Proc, либо Lambda)
  // var proc = new Proc(_eval(cell.list[0])); // так не надо,
  // а то сама "встроенная" функция будет в proc.proc.proc
  var proc = _eval(cell.list[0], env);
  var argums = [];
  for (var i = 1; i < cell.list.length; i++)
    argums.push(_eval(cell.list[i], env));
  if (proc.type == "Proc") {
    return proc.proc(argums);
  }
  else if (proc.type == 'Lambda') {
    return _eval(proc.list[2], new Env(proc.env, proc.list[1].list,
          argums));
  }
  return "not a function";
}

// преобразователь cell -> string, чтобы можно было вывести результат
// в примере называется to_string
function cellToString(cell) {
  if (cell.type == 'List') {
    var sa = [];
    for (var i = 0; i < cell.list.length; i++) {
      var cv = cellToString(cell.list[i]).trim();
      if (cv != '')
        sa.push(cv);
    }
    return '(' + sa.join(' ') + ')';
  }
  else if (cell.type == 'Proc') {
    return '<Proc>';
  }
  else if (cell.type == 'Lambda') {
    return '<Lambda>';
  }
  else
    return cell.val;
}

// read-eval-print loop
function repl(input) {
  var tokens = tokenize(input);
  var ast = getAST(tokens);
  return cellToString(_eval(ast, global_env));
}

// конец интерпретатора ===================================================

/// тесты для интерпретатора
function TEST(exp, expected) {
  try {
    var res = repl(exp);
  }
  catch (e) {
    res = 'EXCEPTION: ' + e;
  }
  if (res != expected) {
    console.log('FAILED, test ' + exp + ' Expected ' + expected
        + ' but got ' + res);
  }
  else {
    console.log('OK, test ' + exp + ' Expected ' + expected
        + ' and got ' + res);
  }
}

function runTests() {
  TEST('(s= "hello" "hello")', "#t");
  TEST('(s= "hello" "world")', "#f");
  TEST('(s+ "hello" "world")', "helloworld");
  TEST('(DOMSETVAL "button1" "TouchedFromLispy")', "#t");
  TEST('(DOMSETVAL "button1" (s+ "TouchedFromLispy" "Again"))', "#t");
  TEST('(and (> 10 1) (> 10 1))', '#t');
  TEST('(and (> 10 1) (< 10 1))', '#f');
  TEST('(and #t #t #t)', '#t');
  TEST('(and #t #t #f)', '#f');
  TEST('(or #t)', '#t');
  TEST('(or #f)', '#f');
  TEST('(or #t #f)', '#t');
  TEST('(or #f #f)', '#f');
  //
  TEST("(quote (testing 1 (2.0) -3.14e159))", "(testing 1 (2.0) -3.14e159)");
  TEST("(+ 2 2)", "4");
  TEST("(- 10 3)", "7");
  TEST("(/ 144 2)", "72");
  TEST("(/ 144 2 2)", "36");
  TEST("(<= 100 100)", "#t");
  TEST("(<= 100 500)", "#t");
  TEST("(<= 100 99)", "#f");
  TEST("(+ (* 2 100) (* 1 10))", "210");
  TEST("(if (> 6 5) (+ 1 1) (+ 2 2))", "2");
  TEST("(if (< 6 5) (+ 1 1) (+ 2 2))", "4");
  TEST("(define x 3)", "3");
  TEST("x", "3");
  TEST("(+ x x)", "6");
  TEST("(begin (define x 1) (set! x (+ x 1)) (+ x 1))", "3");
  TEST("((lambda (x) (+ x x)) 5)", "10");
  TEST("(define twice (lambda (x) (* 2 x)))", "<Lambda>");
  TEST("(twice 5)", "10");
}

// конец тестов для интерпретатора ===========================================
//

// Преобразователь JSON в программу для интерпретатора

var Rules  = ' o = ' 
+ '{ '

+  '"RULES":{  '
+ '  "PAYTYPE_01":{  '
+ '    "IF":{  '
+ '      "AND":[{"=":"1"}],  '
+ '      "OR":[{}]  '
+ '    },  '
+ '    "SHOW":["SCRCODE"],  '
+ '    "HIDE":["BCN","BCCVV"],  '
+ '    "MANDATORY":["SCRCODE"]  '
+ '  },   '
+ '  "PAYTYPE_02":{  '
+ '    "IF":{  '
+ '      "AND":[{"=":"2"}],  '
+ '      "OR":[{}]  '
+ '    },  '
+ '    "SHOW":["BCN","BCCVV"],  '
+ '    "HIDE":["SCRCODE"],  '
+ '    "MANDATORY":["BCN","BCCVV"]  '
+ '  }  '
+ '} '
  
+ '}'
;

// преобразовывает JSON-объект в программу на lispy
function ReqToLispy(reqName, Req) {
  var result = "";
  var if_and = "", if_or = "", if_obj = "", if_and_wrapper = "";
  // поскольку все равно не формализовано, исходим из примерно такой
  // грамматики:
  // IF ::= ( [AND_ARRAY] | [OR_ARRAY] | {single clause} )
  if (Req.IF) {
    // одиночное условие в виде { "=":"value1"}
    for (var pn in Req.IF) {
      if (Req.IF[pn].constructor != Array)
        if_obj += ' (' + 'REQ'+pn + ' ' + '"'+reqName+'"'
            + ' ' + '"'+Req.IF[pn]+'"' + ') ';
    }
    // массив условий AND в виде "AND":[{"=":"value1"},{">=":"value2"},{">=":"value3"}]
    if (Req.IF.AND) {
      if_and += '(and ';
      for (var i = 0; i < Req.IF.AND.length; i++) {
        var ANDCls = Req.IF.AND[i];
        for (var pn in ANDCls) {
          if_and += ' (' + 'REQ'+pn + ' ' + '"'+reqName+'"'
            + ' ' + '"'+ANDCls[pn]+'"' + ') ';
        }
      }
      if_and += ' ) ';
    }
    // такой же массив как для AND, но для OR
    if (Req.IF.OR) {
      if_or += '(or ';
      for (var i = 0; i < Req.IF.AND.length; i++) {
        var ANDCls = Req.IF.AND[i];
        for (var pn in ANDCls) {
          if_or += ' (' + 'REQ'+pn + ' ' + '"'+reqName+'"'
            + ' ' + '"'+ANDCls[pn]+'"' + ') ';
        }
      }
      if_or += ' ) ';
    }
    // соединяем все заданные условия через отношение AND
    if (if_obj != '') if_and_wrapper += ' ' + if_obj + ' ';
    if (if_and != '') if_and_wrapper += ' ' + if_and + ' ';
    if (if_or != '') if_and_wrapper += ' ' + if_or + ' ';
    if_and_wrapper = ' (and ' + if_and_wrapper + ' ) ';
    result = '(if ' + if_and_wrapper + ' ';
    var show_se = "";
    var hide_se = "";
    var manda_se = "";
    if (Req.SHOW) {
      for (var i = 0; i < Req.SHOW.length; i++) {
        show_se += ' ' + '"'+Req.SHOW[i]+'"' + ' ';
      }
      if (show_se != '')
        show_se = ' (SHOW ' + show_se + ' ) ';
    }
    if (Req.HIDE) {
      for (var i = 0; i < Req.HIDE.length; i++) {
        hide_se += ' ' + '"'+Req.HIDE[i]+'"' + ' ';
      }
      if (hide_se != '')
        hide_se = ' (HIDE ' + hide_se + ' ) ';
    }
    if (Req.MANDATORY) {
      for (var i = 0; i < Req.MANDATORY.length; i++) {
        manda_se += ' ' + '"'+Req.MANDATORY[i]+'"' + ' ';
      }
      if (manda_se != '')
        manda_se = ' (MANDATORY ' + manda_se + ' ) ';
    }
    if (show_se != '' || hide_se != '' || manda_se != '')
      result += ' (begin ' + show_se + ' ' + hide_se + ' ' + manda_se + ' ) ';
    else // для синтаксической корректности, т.к. if требует минимум 2 аргумента
      result += ' #f ';
    result += ' ) '; // for (if
  }
  return result;
}

function execRules(rulesObj) {
  for (var reqName in rulesObj) {
    var Req = rulesObj[reqName];
    var lispy_prog = ReqToLispy(reqName, Req);
    console.log('About to exec: ' + lispy_prog);
    repl(lispy_prog);
  }
}



