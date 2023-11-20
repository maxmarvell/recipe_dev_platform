document.addEventListener('DOMContentLoaded', function () {

    // Obtain the recipe ID
    const recipeId = document.querySelector('.recipe-title').id;

    // Create a template for a recipe ticket
    let container = document.querySelector('.recipe-ticket__container')
    const ticketTemplate = container.cloneNode(true)

    // Fetch the current recipe data with API route
    fetch(`/recipes/${recipeId}`)
    .then(response => response.json())
    .then(data => {
        // Yield the recipe
        let recipe = data.recipe;

        // Fill primary ticket with data
        let ticket = compileTicket(recipe);
        container.replaceWith(ticket)

        // Fill form with current data
        compileForm(recipe,ticket)

        // Compile historical tickets
        compileHistory(recipe.history)
    })


    // Check for a form submit and then handle PUT request
    const submit = document.querySelector('form')
    submit.addEventListener('submit', iterateRecipe)


    // Check if user wnat to open recipe notes
    document.addEventListener('click',function(e) {
        let target = e.target.closest('.toggle-notes')
        if (target) {
            let container = target.closest('.recipe-ticket__container')
            resetSlideOuts(container)
            target.classList.add('closed')
            container.querySelector('.tag__container').classList.add('open')
            container.querySelector('.notes__container').parentNode.classList.add('open')
        }
    })

    // Check if user wants to open the edit recipe module
    document.addEventListener('click',function(e) {
        let target = e.target.closest('.toggle-edit')
        if (target) {
            let container = target.closest('.recipe-ticket__container')
            resetSlideOuts(container)
            target.classList.add('closed')
            container.querySelector('form.update-recipe').parentNode.classList.add('open')
        }
    })

    // Check if the user wants to close any open modules
    document.addEventListener('click',function(e) {
        let target = e.target.closest('#close-slideout')

        if (target) {
            let container = target.closest('.recipe-ticket__container')
            resetSlideOuts(container)
            container.querySelector('.tag__container').classList.remove('open')
        }
    })

    function compileTicket(data) {

        // Fill the ticket date
        let template = ticketTemplate.cloneNode(true)
        template.querySelector('.ticket-date').innerHTML += Date(data.created);
    
        // Compile the ingredient list
        let ingredientWrapper = template.querySelector('.ticket-ingredient__wrapper');
        let ingredientContainer = template.querySelector('.ticket-ingredient__container');
        data.ingredients.forEach(ingredient => {
            let template = ingredientWrapper.cloneNode(true);
            template.querySelector('.recipe-quantity').innerHTML = ingredient.quantity;
            template.querySelector('.recipe-unit').innerHTML = ingredient.unit;
            template.querySelector('.recipe-ingredient').innerHTML = ingredient.ingredient;
            ingredientContainer.appendChild(template);
        })
        ingredientContainer.removeChild(ingredientWrapper);
    
        // Compile the instruction list
        let instructionWrapper = template.querySelector('.ticket-instruction__wrapper');
        let instructionContainer = template.querySelector('.ticket-instruction__container');
        data.instructions.forEach(instruction => {
            let template = instructionWrapper.cloneNode(true);
            template.querySelector('.recipe-instruction-count').innerHTML = instruction.count;
            template.querySelector('.recipe-instruction-text').innerHTML = instruction.text;
            instructionContainer.appendChild(template);
        })
        instructionContainer.removeChild(instructionWrapper);

        return template
    }
    
    function compileForm(data,container) {
        // Get the ingredient wrapper and container from the ticket
        let ingredientContainer = container.querySelector('.form-ingredients');
        let ingredientWrapper = ingredientContainer.querySelector('.form-ingredients__wrapper');
        
        var counter = 1;
        data.ingredients.forEach(ingredient => {
            // Clone the ingredient field template
            let newElement = ingredientWrapper.cloneNode(true);
            
            // Get the quantity field and set the values and id
            let quantity = newElement.querySelector('input[type=number]')
            quantity.value = ingredient.quantity
            quantity.id = `id_quantity_${counter}`
            quantity.name = `quantity_${counter}`
            
            // Get the ingredient field and set the values and id
            let item = newElement.querySelector('input[type=text]')
            item.value = ingredient.ingredient
            item.id = `id_ingredient_${counter}`
            item.name = `ingredient_${counter}`
            
            // Get the unit field and set the values and id
            let unit = newElement.querySelector('select')
            unit.value = ingredient.unit
            unit.id = `id_unit_${counter}`
            unit.name = `unit_${counter}`

            // Append the element to the container
            ingredientContainer.appendChild(newElement);
            
            // Increase counter to track included fields
            counter++;
        });
        ingredientContainer.removeChild(ingredientWrapper);
        
        // Get the instruction wrapper and container from the ticket
        let instructionContainer = container.querySelector('.form-instructions');
        let instructionWrapper = instructionContainer.querySelector('.form-instructions__wrapper');
        
        data.instructions.forEach(instruction => {
            // Clone the instruction field template
            let newElement = instructionWrapper.cloneNode(true);
            
            // Fill in the instruction count
            newElement.querySelector('div').innerHTML = instruction.count
            
            // Get the instruction text field and set value and id
            newElement.querySelector('input').id = `id_instruction_${instruction.count}`
            newElement.querySelector('input').name = `instruction_${instruction.count}`
            newElement.querySelector('input').value = instruction.text
             
            // Append the element to the container
            instructionContainer.appendChild(newElement);
        });
        instructionContainer.removeChild(instructionWrapper);
    }
    
    function compileHistory(history) {
    
        container = document.querySelector('.recipe-history-container')
    
        history.forEach(recipe => {
            // Compile primary ticket with data
            ticket = compileTicket(recipe);

            // Remove the form slide out
            let formSlideout = ticket.querySelector('form').parentNode
            formSlideout.parentNode.removeChild(formSlideout)

            // Remove the form tag
            let formTag = ticket.querySelector('.toggle-edit')
            formTag.parentNode.removeChild(formTag)
    
            container.appendChild(ticket)
        })
    }





})

function resetSlideOuts(container) {
    Array.from(container.querySelectorAll('.slideout')).forEach(
        div => div.classList.remove('open')
    )
    Array.from(container.querySelectorAll('.recipe-tag')).forEach(
        div => div.classList.remove('closed')
    )
}

function iterateRecipe() {

    let instructions = Array.from(document.querySelectorAll('.form-instructions__wrapper > input'))
    let ingredients = Array.from(document.querySelectorAll('.form-ingredients__wrapper > input[type=text]'))
    let units = Array.from(document.querySelectorAll('.form-ingredients__wrapper > select'))
    let quantities = Array.from(document.querySelectorAll('.form-ingredients__wrapper > input[type=number]'))

    instructions.forEach((el,i) => { instructions[i] = el.value })
    ingredients.forEach((el,i) => { ingredients[i] = el.value })
    units.forEach((el,i) => { units[i] = el.value })
    quantities.forEach((el,i) => { quantities[i] = el.value })

    fetch('', {
        method: "PUT",
        body: JSON.stringify({
            'instructions': instructions,
            'ingredients': ingredients,
            'units': units,
            'quantities': quantities,
        })
    })
    .then(response => response.json())
    .then(console.log(response))
    return false
}

document.addEventListener('DOMContentLoaded', function() {

    // Create a template for the ingredient field
    const ingredientContainer = document.querySelector('.form-ingredients')
    let ingredientWrapper = ingredientContainer.querySelector('.form-ingredients__wrapper')
    const ingredientTemplate = ingredientWrapper.cloneNode(true)

    // Create a template for the instruction field
    const instructionContainer = document.querySelector('.form-instructions')
    let instructionWrapper = instructionContainer.querySelector('.form-instructions__wrapper')
    const instructionTemplate = instructionWrapper.cloneNode(true)

    document.addEventListener('click', function(e) {
        if (e.target.closest('#add-ingredient')) {
            add_ingredient()
        };
        if (e.target.closest('#rmv-ingredient')) {
            rmvLastElement(document.querySelector('.form-ingredients'));
        };
        if (e.target.closest('#add-instruction')) {
            add_instruction()
        };
        if (e.target.closest('#rmv-instruction')) {
            rmvLastElement(document.querySelector('.form-instructions'));
        };
    });

    function add_instruction() {
        let Count = document.querySelector('.form-instructions').childElementCount
        let newElement = instructionTemplate.cloneNode(true)
    
        newElement.querySelector('div').innerHTML = `${Count+1}.`

        // Fill in text field details
        newElement.querySelector('input').id = `id_instruction_${Count+1}`
        newElement.querySelector('input').name = `instruction_${Count+1}`

        document.querySelector('.form-instructions').appendChild(newElement)
    }
    function add_ingredient() {
        let Count = document.querySelector('.form-ingredients').childElementCount
        let newElement = ingredientTemplate.cloneNode(true)

        console.log(newElement,Count)

        // Fill in text field details
        newElement.querySelectorAll('input[type=text]').id = `id_ingredient_${Count+1}`
        newElement.querySelectorAll('input[type=text]').name = `ingredient_${Count+1}`
        
        // Fill in quantity field details
        newElement.querySelectorAll('input[type=number]').id = `id_quantity_${Count+1}`
        newElement.querySelectorAll('input[type=number]').name = `quantity_${Count+1}`
        
        // Fill in unit field details
        newElement.querySelector('select').id = `id_unit_${Count+1}`
        newElement.querySelector('select').name = `unit_${Count+1}`
    
        document.querySelector('.form-ingredients').appendChild(newElement)
    }
    function rmvLastElement(container) {
        var Nodes = container.childNodes
        if (Nodes.length - 1) {
            var Last = Nodes[Nodes.length-1]
            container.removeChild(Last)
        }
    }
})