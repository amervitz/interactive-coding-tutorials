public interface ICounter
{
    int Value { get; }
    void Add(int amount);
}

public sealed class Counter : ICounter
{
    public int Value { get; private set; }

    public Counter(int initialValue)
    {
        Value = initialValue;
    }

    public void Add(int amount)
    {
        // Update this object's Value.
    }
}
