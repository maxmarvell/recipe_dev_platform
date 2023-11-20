from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.db import models
import json
import re

DELIMITER = '|||'

class User(AbstractUser):
    pass

class Ingredient(models.Model):
    name = models.CharField(max_length=50)
    def __str__(self):
        return self.name
    
class PantryIngredient(models.Model):
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.FloatField()

class AbstractRecipe(models.Model):
    title = models.CharField(max_length=50)
    instructions = models.TextField()
    time = models.IntegerField()
    created_on = models.DateTimeField(blank=True, default=timezone.now)

    def get_instructions(self):
        return self.instructions.split(DELIMITER) if self.instructions else []

class Recipe(AbstractRecipe):
    img = models.ImageField(blank=True, upload_to='LaDispensa/static/ladispensa/imgs/recipes')

    def set_instructions(self, instructions_list):
        self.instructions = DELIMITER.join(instructions_list)

    def log_history(self):
        old_recipe = RecipeHistory(
            current=self,
            title=self.title,
            ingredients= json.dumps(
                [ingredient.serialize() for ingredient in self.ingredients.all()]
                ),
            instructions=self.instructions,
            time=self.time,
        )
        old_recipe.save()
        self.history.add(old_recipe)
        self.save()

    def serialize(self):
        return {
            "id": self.id,
            "ingredients": [ingredient.serialize() for ingredient in self.ingredients.all()],
            "title": self.title,
            "time": self.time,
            "instructions": [{
                "count": count,
                "text": text,
            } for count,text in enumerate(self.instructions.split(DELIMITER),1)],
            "img": self.img.url[12:] if self.img else None,
            "created": self.created_on,
            "history": [recipe.serialize() for recipe in self.history.all().order_by("-created_on")],
        }

    
class RecipeHistory(AbstractRecipe):
    current = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='history')
    ingredients = models.TextField()

    def serialize(self):
        return {
            "id": self.id,
            "ingredients": json.loads(self.ingredients),
            "title": self.title,
            "time": self.time,
            "instructions": [{
                "count": count,
                "text": text,
            } for count,text in enumerate(self.instructions.split(DELIMITER),1)],
            "created": self.created_on,
        }

class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.FloatField()
    unit = models.CharField(max_length=10)

    def serialize(self):
        return {
            "ingredient":self.ingredient.name,
            "quantity":self.quantity,
            "unit":self.unit,
        }

    def __str__(self):
        return f'{self.quantity}{self.unit} of {self.item}'