let counter = 0;
const quantity = 13;

function setAttributes(el, attrs) {
    for(var key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
}

document.addEventListener('DOMContentLoaded', load);

window.onscroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        load();
    }
};

function load() {
    const start = counter;
    const end = start + quantity - 1;
    counter = end + 1;

    fetch(`/recipes?start=${start}&end=${end}`)
    .then(response => response.json())
    .then(data => {
        data.posts.forEach(add_post);
    })
};

function add_post(contents) {
    const catalogue = document.querySelector('#recipe-catalogue');
    const template = catalogue.querySelector('div');
    if (template) {
        const recipe = template.cloneNode(true);

        console.log(contents)
    
        recipe.classList.remove('hidden');
        recipe.classList.add('recipe');
        recipe.setAttribute('id', contents.id)
        recipe.querySelector('.recipe-element__title').innerHTML =  contents.title;
        catalogue.append(recipe);
    }
};


// Toggle Upload Recipe Fields
document.addEventListener('DOMContentLoaded', function() {
    const image = document.querySelectorAll('#add-recipe-header > img')
    image.forEach((img) => {
        img.addEventListener('click', function() {
            const body = document.querySelector('.add-recipe-body')
            body.classList.toggle('open');
            if (body.classList.contains('open')) {
                image[0].classList.add('hidden');
                image[1].classList.remove('hidden');
            } else {
                image[1].classList.add('hidden');
                image[0].classList.remove('hidden');
            }
        })
    })
    document.querySelector('#add-ingredient').addEventListener('click', () => add_ingredient());
    document.querySelector('#rmv-ingredient').addEventListener('click', () => rmvLastElement(
        document.querySelector('.form-ingredients')
    ));
    document.querySelector('#add-instruction').addEventListener('click', () => add_instruction());
    document.querySelector('#rmv-instruction').addEventListener('click', () => rmvLastElement(
        document.querySelector('.form-instructions')
    ));
})
function add_instruction() {
    const Wrapper = document.querySelector('.form-instructions')
    const Count = Wrapper.childElementCount
    const newElement = Wrapper.querySelector('div').cloneNode(true)

    newElement.querySelector('div').innerHTML = `${Count+1}.`
    newElement.querySelector('input').id = `id_instruction_${Count+1}`
    newElement.querySelector('input').name = `instruction_${Count+1}`
    Wrapper.appendChild(newElement)
}
function add_ingredient() {
    const Wrapper = document.querySelector('.form-ingredients')
    const Count = Wrapper.childElementCount
    const newElement = Wrapper.querySelector('div').cloneNode(true)

    var inputs = newElement.querySelectorAll('input')
    inputs[0].id = `id_ingredient_${Count+1}`
    inputs[0].name = `ingredient_${Count+1}`
    inputs[1].id = `id_quantity_${Count+1}`
    inputs[1].name = `quantity_${Count+1}`
    newElement.querySelector('select').id = `id_unit_${Count+1}`
    newElement.querySelector('select').name = `unit_${Count+1}`

    Wrapper.appendChild(newElement)
}
function rmvLastElement(Wrapper) {
    var Nodes = Wrapper.querySelectorAll('div')
    if (Nodes.length - 1) {
        var Last = Nodes[Nodes.length-1]
        Wrapper.removeChild(Last)
    }
}


// Query Recipe Catalogue
document.addEventListener('DOMContentLoaded', function () {

    const search = document.getElementById('search');
    const container = document.getElementById('recipe-catalogue')

    search.addEventListener('keyup', function (event) {
        
        var value = search.value;

        if (event.key.length === 1 | event.key === 'Backspace') {


            var recipes =  container.querySelectorAll('.recipe')
            recipes.forEach((div) => div.classList.add('remove'))
    
            counter = 0;
            const start = counter;
            const end = start + quantity - 1;
            counter = end + 1;
    
            fetch(`/recipes?start=${start}&end=${end}&title=${value}`)
            .then(response => response.json())
            .then(data => {
                data.posts.forEach(add_post);
                recipes.forEach((div) => div.parentNode.removeChild(div))
                window.onscroll = () => {
                    if (window.innerHeight + window.scrollY >= document.body.offsetHeight)  {

                        const start = counter;
                        const end = start + quantity - 1;
                        counter = end + 1;
                
                        fetch(`/recipes?start=${start}&end=${end}&title=${value}`)
                        .then(response => response.json())
                        .then(data => {
                            data.posts.forEach(add_post);
                        })
                    }
                }
        })
        if (value === '') {
            load();
        }
    }})
})