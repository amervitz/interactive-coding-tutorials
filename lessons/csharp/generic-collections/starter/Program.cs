using System;
using System.Collections.Generic;

var names = new List<string> { "Ada", "Grace" };
// Add Linus to the list.
var scores = new Dictionary<string, int> { ["Ada"] = 10, ["Grace"] = 12 };
// Add a score of 15 for Linus.

Console.WriteLine($"Names: {string.Join(", ", names)}");
Console.WriteLine($"Linus: {scores.GetValueOrDefault("Linus", 0)}");
