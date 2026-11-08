## Records and LINQ

`record Learner(string Name, int Score)` declares a data type with generated
properties and value-based equality. Two learner records with the same values
compare equal. Records are useful for representing data passed through a query.

LINQ expresses operations over sequences. Import `System.Linq`, then compose
methods. `Where` filters, `OrderBy` sorts, and `Select` transforms elements.

```csharp
var shortNames = names
    .Where(name => name.Length < 5)
    .OrderBy(name => name)
    .Select(name => name.ToUpperInvariant());
```

`name => name.Length < 5` is a lambda: a function passed as an argument.
Most of these operations are deferred: they run when you enumerate the result,
for example using `foreach`, `string.Join`, or `ToArray`. `ToArray` materializes
a snapshot. `OrderByDescending` reverses the sort direction.

### 🎯 Exercise: Query passing learners

Filter to scores of **60 or higher**, then sort by score **descending**.
Keep the projection to names. Expected output: `Passing: Ada, Linus`.

> Update the predicate and the sorting method, leaving the source data unchanged.
