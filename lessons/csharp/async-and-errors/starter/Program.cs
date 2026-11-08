using System;

Console.WriteLine($"Score: {await ScoreService.LoadAsync("21")}");

// Catch FormatException when loading "oops" and print Invalid score.
