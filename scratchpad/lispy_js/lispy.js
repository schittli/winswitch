String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); };

// tokenize('(+ 2 (* 5 7))')
// tokenize('(+ 2 5)')
// _eval(getAST(tokenize('(+ 2 5)')))
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

function proc_add(cl) { // cl == cell list, ������� ������ cell � ����� Number
  var r = parseInt(cl[0].val);
  for (var i = 1; i < cl.length; i++) {
    r = r +  parseInt(cl[i].val);
  }
  return new Atom(r.toString());
}

function proc_sub(cl) { // cl == cell list, ������� ������ cell � ����� Number
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

// ���������� ������ ��������������� ������� �� ������ �������.
// "���" ������������� �������� - Cell
// � ������� ���������� read_from
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

function _eval(cell, env) {
  if (cell.type == "Symbol")
    return env.findEnv(cell.val).findCell(cell.val);
  if (cell.type == "Number")
    return cell;
  if (cell.type == "String")
    return cell;
  // nil � ������ ������ � Scheme ������������
  if (cell.list.length == 0)
    return nil;
  if (cell.list[0].type == "Symbol") {
    // ��� ���������� �����
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
      return env.findEnv(cell.list[1].val)._map[cell.list[1].val]
         = _eval(cell.list[2], env);
    }
    if (cell.list[0].val == 'begin') {
      // ��������� ���, ����� ��������� cell
      for (var i = 1; i < cell.list.length - 1; i++) {
        _eval(cell.list[i], env);
      }
      // ��������� � ������� ��������� cell
      return _eval(cell.list[cell.list.length - 1], env);
    }
    if (cell.list[0].val == 'lambda') {
      cell.type = 'Lambda';
      cell.env = env;
      return cell;
    }
  }
  // ���� ����� ����, ������ ������� (���������� Proc, ���� Lambda)
  // var proc = new Proc(_eval(cell.list[0])); // ��� �� ����, � �� ����� proc.proc.proc
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

// � ������� ���������� to_string
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

function repl(input) {
  var tokens = tokenize(input);
  var ast = getAST(tokens);
  return cellToString(_eval(ast, global_env));
}

// ����������
nil = new Atom('nil');
true_sym = new Atom('#t');
false_sym = new Atom('#f');

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

function Env(outerEnv, params, args) {
  this._map = {}; // symbol -> cell
  this._outerEnv = outerEnv;
  if (params && args) { // ����� ��������� ������ ���������
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

/// tests
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
