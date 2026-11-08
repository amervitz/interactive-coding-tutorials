using System;

ICounter counter = new Counter(10);
counter.Add(5);
counter.Add(3);
Console.WriteLine($"Count: {counter.Value}");
