document.addEventListener('DOMContentLoaded', function () {
    
    let closed = document.getElementById('menu-select__closed')
    let open = document.getElementById('menu-select__open')
    
    closed.querySelector('#menu-select__decorator').addEventListener('click', function () {
        closed.style.display = 'none'
        open.style.display = 'block'
    });

    open.querySelector('#menu-select__decorator').addEventListener('click', function () {
        open.style.display = 'none'
        closed.style.display = 'block'
    });
});