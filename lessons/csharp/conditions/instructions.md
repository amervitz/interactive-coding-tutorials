## Decisions and Conditions

An `if` statement executes a block only when its condition is true. `else`
handles the alternative; `else if` lets you test another condition.

```csharp
int temperature = 18;
if (temperature < 0)
    Console.WriteLine("Freezing");
else if (temperature < 20)
    Console.WriteLine("Cool");
else
    Console.WriteLine("Warm");
```

Comparisons use `==`, `!=`, `<`, `<=`, `>`, and `>=`. Combine conditions with
`&&` (and), `||` (or), and `!` (not). `==` compares; `=` assigns.
Braces group multiple statements into a block and make branch boundaries clear.

Test broad ranges in the right order. Checking `score >= 60` before
`score >= 80` would capture high scores too, preventing the later branch.

### 🎯 Exercise: Add the middle grade

Keep the score at **75**. Add an `else if` branch that assigns **B** for
scores at least **60**, after the A branch and before the final else.
The console should print `Grade: B`.

Then experiment with scores 59, 60, 79, and 80 to explore the boundaries.

> The first matching branch wins. Restore 75 before verifying.
