sel_id = '';
move_cnt = 0;
moves = [];

function btn_recordmove_click() {
  alert(sel_id + ':' + moves.join(','));
}

function blackf_click() {
    // если шашка
    if ($(this).hasClass('whitech')) {
      if (window.sel_id == '') {
        $(this).addClass('whitech_selected');
        window.sel_id = $(this).attr('id');
        moves.length = 0;
      }
      else {
        if ($(this).attr('id') == window.sel_id) {
          $(this).removeClass('whitech_selected');
          window.sel_id = '';
          move_cnt = 0;
          moves.length = 0;
          $('.blackf').text('');
        }
      }
    }
    // todo : else if blackch
    else { // пустое поле
      if (window.sel_id != '') {
        if ($(this).text() == '') {
          move_cnt = move_cnt + 1;
          $(this).text(move_cnt);
          moves[move_cnt - 1] = $(this).attr('id');
        }
        else { // возможность отменить последний ход
          if (move_cnt > 0 && $(this).text() == move_cnt.toString()) {
            $(this).text('');
            move_cnt = move_cnt - 1;
            moves.pop();
          }
        }
      }
    }
    // включать / выключать кнопку record_move
    if (move_cnt > 0) {
      $('#btn_recordmove').removeAttr('disabled');
    } else {
      $('#btn_recordmove').attr('disabled', 'true');
    }
}

function record_move() {
}

$(document).ready(function () {

  $('.blackf').click(blackf_click);

});

function toggleBtnClick() {
  $('#cell')
  .toggleClass('arrowup')
  .toggleClass('arrowdown');
}


