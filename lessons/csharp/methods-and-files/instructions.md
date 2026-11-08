## Methods and Multiple Files

A method packages an operation so you can call it with different inputs.
Parameters name the inputs; the return type describes the result. `void`
means a method does not return a value.

```csharp
public static class Calculator
{
    public static int Double(int value)
    {
        return value * 2;
    }
}
```

`Calculator.Double(5)` returns `10`. `public` makes the method accessible
outside its class, and `static` lets you call it on the type without creating
an object. `=> expression` is a shorter method body that returns an expression.

The runner compiles all `.cs` tabs together. You do not import another C# file
by path. Types in the same namespace can refer to one another directly;
`using` brings names from another namespace into scope. Keep top-level
statements in one file, here `Program.cs`.

### 🎯 Exercise: Reuse a greeting

In `Greeting.cs`, change the method to return **Welcome, {name}!**.
In `Program.cs`, change the first argument from `browser` to `C#` and keep
the second call for Ada. Expected output:

```text
Welcome, C#!
Welcome, Ada!
```

> Edit the shared method once so both calls use the new wording.
