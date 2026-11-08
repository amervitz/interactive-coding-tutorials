## Variables and Types

A variable gives a name to a value. Its type determines what values and
operations are allowed. `string` holds text, `int` holds whole numbers,
`bool` holds `true` or `false`, and `decimal` is useful for decimal amounts.

```csharp
int score = 10;
score = score + 5;
bool passed = score >= 12;
Console.WriteLine($"Score: {score}; passed: {passed}");
```

`=` assigns a value. Arithmetic operators include `+`, `-`, `*`, and `/`.
Integer division discards the fractional part: `5 / 2` is `2`. Use a decimal
operand when you need a decimal result. The `m` suffix makes `3.50m` a decimal.

A string beginning with `$` can insert expressions inside `{braces}`.
The format `:0.00` displays two decimal places. `var` lets the compiler infer
a local variable's type from its initial value; it does not make it untyped.

### 🎯 Exercise: Price an order

Change the quantity to **4** and the unit price to **2.25m**. Keep the
calculation based on those variables. The output should be:

```text
4 notebooks cost 9.00
```

> Change the inputs rather than replacing the calculation with a fixed answer.
