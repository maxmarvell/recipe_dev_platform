from django.urls import path
from . import views

urlpatterns = [
    path("", views.landing, name="landing"),
    path("index", views.index, name="index"),
    path("submit", views.submit_recipe, name="submit-recipe"),
    path("test-kitchen/<int:recipe_id>", views.test_kitchen, name="test-kitchen"),

    # API routes
    path("recipes", views.recipes, name="get_recipes"),
    path("recipes/<int:recipe_id>", views.recipe, name="recipe"),
]