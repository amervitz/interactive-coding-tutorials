using System;
using System.Threading.Tasks;

public static class ScoreService
{
    public static async Task<int> LoadAsync(string text)
    {
        await Task.Delay(10);
        return int.Parse(text);
    }
}
