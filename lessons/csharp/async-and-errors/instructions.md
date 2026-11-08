## Async Methods and Exceptions

`Task<T>` represents an operation that will produce a value of type `T`.
An `async` method can use `await` to pause until an operation finishes, allowing
the worker's event loop to continue. `Task.Delay` simulates a delay here; it
does not fetch data from a server. Async does not automatically mean parallel.

Use `await` rather than blocking with `.Result` or `.Wait()`, which is not
supported for pending tasks in this browser runtime. Top-level statements can
also use `await`.

An exception interrupts normal control flow. A `try` block can be followed by
`catch` to handle a specific failure, and `finally` for cleanup that must run
either way. Exceptions from an async method are observed when awaiting its task.

```csharp
try
{
    int value = await ScoreService.LoadAsync("not a number");
    Console.WriteLine(value);
}
catch (FormatException)
{
    Console.WriteLine("Please provide digits");
}
```

Catch failures you can handle. For ordinary input validation, `int.TryParse`
is often a better choice than throwing; this exercise deliberately uses parsing
exceptions to teach how errors travel through awaited calls.

### 🎯 Exercise: Recover from invalid input

Keep the successful load of `"21"`. Add a second awaited call with `"oops"`
inside `try`, and catch **FormatException** to print **Invalid score**.
Expected output:

```text
Score: 21
Invalid score
```

> Handle the second call's exception in Program.cs; keep ScoreService unchanged.
