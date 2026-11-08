## Loops and Arrays

An array stores a fixed number of values of one type. Array indexes start at
zero: `numbers[0]` is the first item. `numbers.Length` gives the item count.
Accessing an index outside the array throws an exception.

`foreach` visits every element without requiring an index:

```csharp
string[] names = { "Ada", "Grace" };
foreach (string name in names)
{
    Console.WriteLine(name);
}
```

Use `for` when you need the position: `for (int i = 0; i < names.Length; i++)`.
`i++` adds one. A `while` loop repeats while its condition remains true.
Ensure the condition can eventually become false; **Stop** can terminate an
accidental infinite loop without freezing your editor.

### 🎯 Exercise: Sum the numbers

Inside the `foreach` block, add each `number` to `total` with `+=`.
Keep the array unchanged. Print these two lines:

```text
Total: 20
Count: 4
```

> `total += number` means `total = total + number`.
