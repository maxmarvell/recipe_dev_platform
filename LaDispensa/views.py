from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.db.models import Q
from django.urls import reverse
from django import forms
import re
from django.views.decorators.csrf import csrf_exempt
import json

from .models import User, Recipe, Ingredient, RecipeIngredient

CHOICES = (
    ('', ''),
    ('g', 'g'),
    ('unit(s)', 'unit(s)'),
    ('kg', 'kg'),
    ('ml', 'ml'),
    ('L', 'L'),
    ('tsp', 'tsp'),
    ('tbsp', 'tbsp'),
    ('cup(s)', 'cup(s)'),
)

class RecipeForm(forms.Form,):
    def __init__(self, *args, **kwargs):
        num_instruction = kwargs.pop('num_instructions')
        num_ingredients = kwargs.pop('num_ingredients')
        super(RecipeForm, self).__init__(*args, **kwargs)

        counter = 1
        for _ in range(num_instruction):
            self.fields['instruction_' + str(counter)] = forms.CharField()
            counter += 1

        counter = 1
        for _ in range(num_ingredients):
            self.fields['ingredient_' + str(counter)] = forms.CharField()
            self.fields['quantity_' + str(counter)] = forms.IntegerField()
            self.fields['unit_' + str(counter)] = forms.ChoiceField(choices = CHOICES)
            counter += 1

        for visible, fieldname in zip(self.visible_fields(),self.fields):
            if fieldname != 'image':
                visible.field.widget.attrs['class'] = 'form__field'
                visible.field.widget.attrs['name'] = 'input'
                visible.field.widget.attrs['autocomplete'] = 'off'

    def get_instruction_fields(self):
        c = 0
        for field_name in self.fields:
            if field_name.startswith('instruction_'):
                c += 1
                yield c, self[field_name]

    def get_ingredient_fields(self):
        for field_name in self.fields:
            if field_name.startswith('ingredient_'):
                m = re.search(r'\d+$',field_name)
                i = int(m.group()) if m else None
                yield self[field_name], self[f'quantity_{i}'], self[f'unit_{i}']

    title = forms.CharField()
    time = forms.IntegerField()
    image = forms.ImageField(required=False)


def landing(request):
    return render(request, "ladispensa/landing.html")


def index(request):
    return render(request, "ladispensa/index.html", {
        'form': RecipeForm(num_ingredients=3,num_instructions=3)
    })


@csrf_exempt
def recipe(request, recipe_id):
    if request.method == "DELETE":
        Recipe.objects.get(pk=recipe_id).delete()
        return JsonResponse({"message": "Recipe deleted Succesfully."}, status=200)

    if request.method == "GET":
        data = Recipe.objects.get(pk=recipe_id)
        return JsonResponse({
            'recipe': data.serialize()
            })


def recipes(request):
    start = int(request.GET.get("start") or 0)
    end = int(request.GET.get("end") or (start + 9))

    if request.GET.get("title"):
        condition = Q(title__icontains=request.GET.get("title"))
        data = Recipe.objects.filter(condition)
    else:
        data = Recipe.objects.all()

    end = min(end,len(data))
    
    return JsonResponse({
        "posts": [recipe.serialize() for recipe in data[start:end]],
    })


def submit_recipe(request):
    if request.method == "POST":

        items = request.POST.items()
        instructions = [value for key, value in items if re.compile(r'instruction_[0-9]').match(key)]

        ingredients = [value for key, value in request.POST.items() if 
                      re.compile(r'ingredient_[0-9]').match(key)]
        quantities = [value for key, value in request.POST.items() if 
                      re.compile(r'quantity_[0-9]').match(key)]
        units = [value for key, value in request.POST.items() if 
                      re.compile(r'unit_[0-9]').match(key)]
        form = RecipeForm(request.POST,
                          request.FILES,
                          num_instructions=len(instructions),
                          num_ingredients=len(ingredients)
                          )

        if form.is_valid():
            recipe = Recipe.objects.create(
                title=form.cleaned_data["title"],
                time=form.cleaned_data["time"],
            )
            if form.cleaned_data["image"]:
                recipe.img = form.cleaned_data["image"]
            recipe.set_instructions(instructions)
            recipe.save()

            for i,q,u in zip(ingredients,quantities,units):
                if Ingredient.objects.filter(name=i).exists():
                    ingredient = Ingredient.objects.get(name=i)
                else:
                    ingredient = Ingredient(name=i)
                    ingredient.save()

                recipe_ingredient = RecipeIngredient(
                    ingredient=ingredient,
                    recipe=recipe,
                    quantity=q,
                    unit=u,
                )
                recipe_ingredient.save()
                recipe.ingredients.add(recipe_ingredient)
            
            recipe.save()

        return HttpResponseRedirect(reverse("index"))
    return HttpResponseRedirect(reverse("index"))


@csrf_exempt
def test_kitchen(request, recipe_id):
    if request.method == "GET":
        recipe = Recipe.objects.get(pk=recipe_id)
        return render(request, "ladispensa/test_kitchen.html",{
            'recipe': recipe.serialize(),
            'form': RecipeForm(num_ingredients=1,num_instructions=1),
        })
    
    elif request.method == "PUT":
        recipe = Recipe.objects.get(pk=recipe_id)
        recipe.log_history()
        data = json.loads(request.body)
        recipe.set_instructions(data['instructions'])

        for i,q,u in zip(data['ingredients'],data['quantities'],data['units']):
            if Ingredient.objects.filter(name=i).exists():
                    ingredient = Ingredient.objects.get(name=i)
            else:
                ingredient = Ingredient(name=i)
                ingredient.save()
            
            if RecipeIngredient.objects.filter(
                ingredient=ingredient,
                recipe=recipe,
                quantity=q,
                unit=u,
            ).exists():
                continue
            elif RecipeIngredient.objects.filter(
                ingredient=ingredient,
                recipe=recipe,
            ).exists():
                recipe_ingredient = RecipeIngredient.objects.get(ingredient=ingredient,
                                                                 recipe=recipe,)
                recipe.ingredients.remove(recipe_ingredient)

            recipe_ingredient = RecipeIngredient(
                ingredient=ingredient,
                recipe=recipe,
                quantity=q,
                unit=u,
            )
            recipe_ingredient.save()

            recipe.ingredients.add(recipe_ingredient)

        recipe.save()

        return JsonResponse({
        "message": "post updated successfully",
    }, status=201)