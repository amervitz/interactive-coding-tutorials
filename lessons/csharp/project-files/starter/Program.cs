var learners = new[] { new Learner("Ada", 90), new Learner("Grace", 55), new Learner("Linus", 75) };
Console.WriteLine(Report.Summary(learners));
#if COURSE_COMPLETE
Console.WriteLine("Course complete!");
#else
Console.WriteLine("Demo mode");
#endif
