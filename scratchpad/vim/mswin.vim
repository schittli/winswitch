" Set options and add mapping such that Vim behaves a lot like MS-Windows
"
" Maintainer:    Bram Moolenaar <Bram@vim.org>
" Last change:    2006 Apr 02

" bail out if this isn't wanted (mrsvim.vim uses this).
if exists("g:skip_loading_mswin") && g:skip_loading_mswin
  finish
endif

" set the 'cpoptions' to its Vim default
if 1    " only do this when compiled with expression evaluation
  let s:save_cpo = &cpoptions
endif
set cpo&vim

" set 'selection', 'selectmode', 'mousemodel' and 'keymodel' for MS-Windows
behave mswin

" backspace and cursor keys wrap to previous/next line
set backspace=indent,eol,start whichwrap+=<,>,[,]

" backspace in Visual mode deletes selection
vnoremap <BS> d

" CTRL-X and SHIFT-Del are Cut
vnoremap <C-X> "+x
vnoremap <S-Del> "+x

" CTRL-C and CTRL-Insert are Copy
vnoremap <C-C> "+y
vnoremap <C-Insert> "+y

" CTRL-V and SHIFT-Insert are Paste
"map <C-V>        "+gP
map <S-Insert>        "+gP

"cmap <C-V>        <C-R>+
cmap <S-Insert>        <C-R>+

" Pasting blockwise and linewise selections is not possible in Insert and
" Visual mode without the +virtualedit feature.  They are pasted as if they
" were characterwise instead.
" Uses the paste.vim autoload script.

exe 'inoremap <script> <C-V>' paste#paste_cmd['i']
exe 'vnoremap <script> <C-V>' paste#paste_cmd['v']

imap <S-Insert>        <C-V>
vmap <S-Insert>        <C-V>

" Use CTRL-Q to do what CTRL-V used to do
noremap <C-Q>        <C-V>

" Use CTRL-S for saving, also in Insert mode
noremap <C-S>        :update<CR>
vnoremap <C-S>        <C-C>:update<CR>
inoremap <C-S>        <C-O>:update<CR>

" For CTRL-V to work autoselect must be off.
" On Unix we have two selections, autoselect can be used.
if !has("unix")
  set guioptions-=a
endif

" CTRL-Z is Undo; not in cmdline though
noremap <C-Z> u
inoremap <C-Z> <C-O>u

" CTRL-Y is Redo (although not repeat); not in cmdline though
"noremap <C-Y> <C-R>
"inoremap <C-Y> <C-O><C-R>

" Alt-Space is System menu
if has("gui")
  noremap <M-Space> :simalt ~<CR>
  inoremap <M-Space> <C-O>:simalt ~<CR>
  cnoremap <M-Space> <C-C>:simalt ~<CR>
endif

" CTRL-A is Select all (klvov: disabled)
"noremap <C-A> gggH<C-O>G
"inoremap <C-A> <C-O>gg<C-O>gH<C-O>G
"cnoremap <C-A> <C-C>gggH<C-O>G
"onoremap <C-A> <C-C>gggH<C-O>G
"snoremap <C-A> <C-C>gggH<C-O>G
"xnoremap <C-A> <C-C>ggVG

" klvov: CTRL-Tab is Next tab
nnoremap  <C-Tab> :tabnext<CR>
inoremap <C-Tab> :tabnext<CR>
cnoremap <C-Tab> :tabnext<CR>
onoremap <C-Tab> :tabnext<CR>

"klvov: CTRL-Shift-Tab is Previous tab
nnoremap  <C-S-Tab> :tabprevious<CR>
inoremap <C-S-Tab> :tabprevious<CR>
cnoremap <C-S-Tab> :tabprevious<CR>
onoremap <C-S-Tab> :tabprevious<CR>

" use Alt-Left and Alt-Right to move current tab to left or right
nnoremap <silent> <A-Left> :execute 'silent! tabmove ' . (tabpagenr()-2)<CR>
nnoremap <silent> <A-Right> :execute 'silent! tabmove ' . tabpagenr()<CR>

" klvov: Tab is Next window
nnoremap <Tab>       <C-W>w
"inoremap <C-Tab> <C-O><C-W>w<C-W>_
"cnoremap <C-Tab> <C-C><C-W>w<C-W>_
"onoremap <C-Tab> <C-C><C-W>w<C-W>_
"
"klvov: Shift-Tab is Previous window
nnoremap  <S-Tab>      <C-W>W
"inoremap <C-S-Tab> <C-O><C-W>W<C-W>_
"cnoremap <C-S-Tab> <C-C><C-W>W<C-W>_
"onoremap <C-S-Tab> <C-C><C-W>W<C-W>_

" CTRL-F4 is :tabclose
nnoremap <C-F4> :tabclose<CR>

" restore 'cpoptions'
set cpo&
if 1
  let &cpoptions = s:save_cpo
  unlet s:save_cpo
endif