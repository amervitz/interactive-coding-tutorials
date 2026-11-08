## Generic Collections

Arrays have a fixed length. `List<T>` grows and shrinks as you add or remove
elements. The type argument `T` tells the compiler what the collection holds:
`List<string>` accepts strings and rejects integers.

```csharp
var tasks = new List<string>();
tasks.Add("Learn C#");
Console.WriteLine(tasks.Count);
```

`Dictionary<TKey, TValue>` associates unique keys with values. With a
`Dictionary<string, int>`, `scores["Ada"] = 10` sets a score. Reading an
absent key using the indexer throws; `TryGetValue` or `GetValueOrDefault`
lets you handle missing keys explicitly.

Generics preserve type information without copying collection code for every
possible type. Lists expose `Count`, while arrays expose `Length`.
`string.Join` combines a sequence of values with a separator.

### 🎯 Exercise: Add a learner

Use `names.Add` to append **Linus** and assign **15** to the dictionary key
`"Linus"`. Keep the existing entries. Expected output:

```text
Names: Ada, Grace, Linus
Linus: 15
```

> The list and dictionary are separate collections; update both.
