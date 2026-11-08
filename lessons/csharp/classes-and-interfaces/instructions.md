## Classes and Interfaces

A class defines objects that combine state and behavior. `new Counter(10)`
creates an object and calls its constructor. Unlike a static method, an
instance method operates on a particular object; two counters keep separate state.

`Value` is a property. `get; private set;` allows callers to read it, while
only code inside the class can assign it. That boundary keeps updates under
the class's control. The constructor establishes its initial state.

An interface describes a contract. `ICounter` promises a readable `Value`
and an `Add` method. `Counter : ICounter` implements that contract. A variable
typed as `ICounter` can hold any object that implements it, allowing callers
to depend on behavior rather than one implementation. `sealed` prevents
other classes from inheriting from `Counter`.

### 🎯 Exercise: Implement the counter

Complete `Counter.Add` so it increases the current value by `amount`.
Keep the existing constructor and the two calls in `Program.cs`.
Expected output: `Count: 18`.

After verifying, try creating a second counter and observe that changing one
does not change the other.

> `Value` is writable inside `Counter`, even though callers cannot set it.
