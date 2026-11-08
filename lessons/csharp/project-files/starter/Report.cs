public record Learner(string Name, int Score);

public static class Report
{
    public static string Summary(IEnumerable<Learner> learners)
    {
        var names = learners.Where(learner => learner.Score >= 60)
            .OrderByDescending(learner => learner.Score)
            .Select(learner => learner.Name);
        return $"Passing: {string.Join(", ", names)}";
    }
}
