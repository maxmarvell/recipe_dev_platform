document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function(e) {
        const target = e.target.closest(".recipe-element");
        if (target) {
            fetch(`/recipes/${target.id}`)
            .then(response => response.json())
            .then(data => showRecipe(data))
        };
    });
});

function showRecipe(data) {
    const template = document.querySelector('.recipe__container');
    const recipe = template.cloneNode(true);
    recipe.classList.add('newNode');

    recipe.querySelector('.recipe-header__wrapper > h1').innerHTML = data.recipe.title;
    if (data.recipe.img) {
        recipe.querySelector('.recipe-image__wrapper > img').src = data.recipe.img;
    }

    recipe.querySelector('.cook-time').innerHTML = data.recipe.time;

    const ingredient_container = recipe.querySelector('.recipe-ingredient__container');
    const ingredient_template = ingredient_container.querySelector('.recipe-ingredient__wrapper');

    data.recipe.ingredients.forEach(ingredient => {
        let newElement = ingredient_template.cloneNode(true);
        newElement.classList.remove('hidden')
        newElement.querySelector('.recipe-quantity').innerHTML = ingredient.quantity;
        newElement.querySelector('.recipe-unit').innerHTML = ingredient.unit;
        newElement.querySelector('.recipe-ingredient').innerHTML = ingredient.ingredient;
        ingredient_container.appendChild(newElement)
    });

    const instruction_container = recipe.querySelector('.recipe-instruction__container');
    const instruction_template = instruction_container.querySelector('.recipe-instruction__wrapper');

    data.recipe.instructions.forEach(instruction => {
        let newElement = instruction_template.cloneNode(true);
        newElement.classList.remove('hidden');
        newElement.querySelector('.recipe-instruction-count').innerHTML = instruction.count;
        newElement.querySelector('.recipe-instruction-text').innerHTML = instruction.text;
        instruction_container.appendChild(newElement);
    });

    recipe.id = data.recipe.id
    
    url = recipe.querySelector('.recipe-actions__container > a').href
    recipe.querySelector('.recipe-actions__container > a').href = url.replace(/\/[^\/]*$/, `/${recipe.id}`)

    recipe.classList.remove('hidden');
    document.querySelector('.form__container').classList.add('hidden');
    document.querySelector('.grid__container').classList.add('hidden');
    document.querySelector('.body').appendChild(recipe);
}

// Close Recipe from recipe
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function(e) {
        const back = e.target.closest('#recipe-icons__back');
        const del = e.target.closest('#recipe-icons__del');
        const cook = e.target.closest('#recipe-icons__cook');
        
        if (back) {
            document.querySelector('.newNode').parentNode.removeChild(
                document.querySelector('.newNode')
            )
            document.querySelector('.form__container').classList.remove('hidden');
            document.querySelector('.grid__container').classList.remove('hidden');
        }
        if (del) {
            let recipe = del.closest('.recipe__container')
            fetch(`/recipes/${recipe.id}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(response => console.log(response['message']))
            recipe.parentNode.removeChild(recipe)
            document.getElementById(recipe.id).parentNode.removeChild(
                document.getElementById(recipe.id)
            )
            document.querySelector('.form__container').classList.remove('hidden');
            document.querySelector('.grid__container').classList.remove('hidden');
        }
    })
})