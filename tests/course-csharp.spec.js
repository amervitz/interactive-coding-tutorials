const { test, expect } = require('@playwright/test');

async function finished(page) {
  await expect(page.locator('#runtime-status')).toContainText('Finished', { timeout: 90000 });
  await expect(page.locator('#run-btn')).toBeEnabled();
}

async function run(page) {
  await page.locator('#run-btn').click();
  await finished(page);
}

async function replace(page, file, from, to) {
  await page.evaluate(({ file, from, to }) => {
    const model = models.get(file);
    if (!model.getValue().includes(from)) throw new Error(`Missing exercise text in ${file}`);
    model.setValue(model.getValue().replace(from, to));
  }, { file, from, to });
}

test('all ten C# lessons start runnable, require an exercise, and advance after solving', async ({ page }) => {
  test.setTimeout(300000);
  await page.goto('/tutorials/index.html?lang=csharp');
  await finished(page);
  await expect(page.locator('.lesson-item')).toHaveCount(10);
  const solutions = [
    [['Program.cs', 'Hello, browser!', 'Hello, C#!']],
    [['Program.cs', 'quantity = 2', 'quantity = 4'], ['Program.cs', '3.50m', '2.25m']],
    [['Program.cs', 'else\n', 'else if (score >= 60)\n{\n    grade = "B";\n}\nelse\n']],
    [['Program.cs', '// Add this number to total.', 'total += number;']],
    [['Greeting.cs', 'Hello,', 'Welcome,'], ['Program.cs', '"browser"', '"C#"']],
    [['Counter.cs', '// Update this object\'s Value.', 'Value += amount;']],
    [['Program.cs', '// Add Linus to the list.', 'names.Add("Linus");'], ['Program.cs', '// Add a score of 15 for Linus.', 'scores["Linus"] = 15;']],
    [['Program.cs', 'Score >= 0', 'Score >= 60'], ['Program.cs', '.OrderBy(', '.OrderByDescending(']],
    [['Program.cs', '// Catch FormatException when loading "oops" and print Invalid score.', 'try { await ScoreService.LoadAsync("oops"); } catch (FormatException) { Console.WriteLine("Invalid score"); }']],
    [['Tutorial.csproj', 'DEMO', 'COURSE_COMPLETE']],
  ];

  for (let index = 0; index < solutions.length; index++) {
    await expect(page.locator('#progress-text')).toHaveText(`Lesson ${index + 1} of 10`);
    if (index > 0) await run(page);
    await expect(page.locator('#compilation-content')).toContainText('Compilation succeeded');
    await expect(page.locator('#compilation-content .error')).toHaveCount(0);
    await expect(page.locator('#output-content .error')).toHaveCount(0);
    await page.locator('#verify-btn').click();
    expect(await page.locator('.verify-item.fail').count()).toBeGreaterThan(0);
    await expect(page.locator('#next-btn')).toBeDisabled();

    for (const [file, from, to] of solutions[index]) await replace(page, file, from, to);
    await run(page);
    await page.locator('#verify-btn').click();
    await expect(page.locator('.verify-item.fail')).toHaveCount(0);
    await expect(page.locator('.lesson-item').nth(index)).toHaveClass(/completed/);
    if (index < 9) await page.locator('#next-btn').click();
  }
  await expect(page.locator('.lesson-item.completed')).toHaveCount(10);
  await expect(page.locator('#next-btn')).toBeDisabled();
  expect(await page.evaluate(() => models.get('Tutorial.csproj').getLanguageId())).toBe('xml');
});

test('project settings control imports, symbols, nullable warnings, and language version', async ({ page }) => {
  test.setTimeout(180000);
  await page.goto('/tutorials/index.html?lang=csharp');
  await finished(page);
  await page.locator('.lesson-item').nth(9).click();
  await run(page);
  await expect(page.locator('#output-content')).toContainText('Demo mode');
  await expect(page.locator('#compilation-content')).toContainText('Project: Tutorial.csproj');

  await replace(page, 'Tutorial.csproj', '<ImplicitUsings>enable', '<ImplicitUsings>disable');
  await run(page);
  await expect(page.locator('#compilation-content')).toContainText('Compilation failed');
  await expect(page.locator('#compilation-content')).toContainText('Console');
  await replace(page, 'Tutorial.csproj', '<ImplicitUsings>disable', '<ImplicitUsings>enable');
  await page.evaluate(() => models.get('Program.cs').setValue('string? name = null;\nConsole.WriteLine(name.Length);'));
  await run(page);
  await expect(page.locator('#compilation-content')).toContainText('error CS8602');
  await expect(page.locator('#output-content')).toBeEmpty();

  await replace(page, 'Tutorial.csproj', '<TreatWarningsAsErrors>true', '<TreatWarningsAsErrors>false');
  await run(page);
  await expect(page.locator('#compilation-content')).toContainText('warning CS8602');
  await expect(page.locator('#compilation-content')).toContainText('Compilation succeeded');
  await expect(page.locator('#output-content')).toContainText('NullReferenceException');

  await page.evaluate(() => models.get('Program.cs').setValue('Console.WriteLine("version test");\nclass Example { public void Method(params System.Collections.Generic.List<int> values) { } }'));
  await replace(page, 'Tutorial.csproj', '<LangVersion>13.0', '<LangVersion>12.0');
  await run(page);
  await expect(page.locator('#compilation-content')).toContainText('Compilation failed');
  await expect(page.locator('#compilation-content')).toContainText('params collections');
  await replace(page, 'Tutorial.csproj', '<LangVersion>12.0', '<LangVersion>13.0');
  await run(page);
  await expect(page.locator('#compilation-content')).toContainText('Compilation succeeded');
  await expect(page.locator('#output-content')).toHaveText('version test');
});

test('invalid or unsupported project behavior is explained instead of ignored', async ({ page }) => {
  test.setTimeout(180000);
  await page.goto('/tutorials/index.html?lang=csharp');
  await finished(page);
  await page.locator('.lesson-item').nth(9).click();
  const cases = [
    ['<Project', 'Invalid project XML'],
    ['<Project Sdk="Microsoft.NET.Sdk"><ItemGroup><PackageReference Include="Example" Version="1.0.0" /></ItemGroup></Project>', 'Unsupported project element'],
    ['<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><TargetFramework>net8.0</TargetFramework></PropertyGroup></Project>', 'TargetFramework must be one of: net10.0'],
    ['<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup Condition="true"><Nullable>enable</Nullable></PropertyGroup></Project>', 'Only unconditional PropertyGroup'],
    ['<!DOCTYPE Project [<!ENTITY example "net10.0">]><Project Sdk="Microsoft.NET.Sdk" />', 'DTD declarations are not supported'],
  ];
  for (const [source, message] of cases) {
    await page.evaluate(source => models.get('Tutorial.csproj').setValue(source), source);
    await run(page);
    await expect(page.locator('#compilation-content .error')).toContainText(message);
    await expect(page.locator('#output-content')).toBeEmpty();
    await expect(page.getByRole('tab', { name: 'Compilation', exact: true })).toHaveAttribute('aria-selected', 'true');
  }
  await page.locator('#reset-btn').click();
  await run(page);
  await expect(page.locator('#compilation-content')).toContainText('Compilation succeeded');
});
