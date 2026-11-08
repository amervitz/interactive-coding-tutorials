using System;

string product = "notebook";
int quantity = 2;
decimal price = 3.50m;
decimal total = quantity * price;

Console.WriteLine($"{quantity} {product}s cost {total:0.00}");
