using System.Xml;
using System.Xml.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

// A deliberately bounded project-file reader, not an MSBuild evaluator. Every
// accepted property changes Roslyn options; unsupported build behavior is rejected.
internal sealed record LessonProject(
    CSharpParseOptions ParseOptions,
    CSharpCompilationOptions CompilationOptions,
    bool ImplicitUsings,
    string? FileName)
{
    internal static LessonProject Read(Dictionary<string, string> files)
    {
        var projects = files.Where(file => file.Key.EndsWith(".csproj", StringComparison.Ordinal)).ToArray();
        if (projects.Length > 1) throw new InvalidOperationException("Only one .csproj file is supported per lesson.");
        var properties = new Dictionary<string, string>();
        if (projects.Length == 1)
        {
            using var input = new StringReader(projects[0].Value);
            using var reader = XmlReader.Create(input, new XmlReaderSettings { DtdProcessing = DtdProcessing.Prohibit, XmlResolver = null });
            XDocument document;
            try { document = XDocument.Load(reader); }
            catch (XmlException error)
            {
                // WASM runtime packs may use resource keys instead of localized
                // XML error messages. Supply an actionable diagnostic ourselves.
                throw new InvalidOperationException($"{projects[0].Key}({error.LineNumber},{error.LinePosition}): Invalid project XML. Use well-formed XML; DTD declarations are not supported.", error);
            }
            var root = document.Root;
            if (root?.Name != "Project" || (string?)root.Attribute("Sdk") != "Microsoft.NET.Sdk" ||
                root.Attributes().Any(attribute => attribute.Name != "Sdk"))
                throw new InvalidOperationException("Use <Project Sdk=\"Microsoft.NET.Sdk\"> without additional attributes.");
            foreach (var group in root.Elements())
            {
                if (group.Name != "PropertyGroup" || group.HasAttributes)
                    throw new InvalidOperationException($"Unsupported project element or attributes: {group.Name}. Only unconditional PropertyGroup settings are supported; NuGet, project references, imports, and build targets cannot run in this browser runner.");
                foreach (var property in group.Elements())
                {
                    var name = property.Name.ToString();
                    if (property.HasAttributes || property.HasElements || !SupportedProperties.Contains(name))
                        throw new InvalidOperationException($"Unsupported project setting: {name}.");
                    if (!properties.TryAdd(name, property.Value.Trim()))
                        throw new InvalidOperationException($"Duplicate project setting: {name}.");
                }
            }
        }

        string Get(string name, string fallback) => properties.GetValueOrDefault(name, fallback);
        string Choice(string name, string fallback, params string[] allowed)
        {
            var value = Get(name, fallback);
            if (!allowed.Contains(value)) throw new InvalidOperationException($"{name} must be one of: {string.Join(", ", allowed)}.");
            return value;
        }

        Choice("TargetFramework", "net10.0", "net10.0");
        Choice("OutputType", "Exe", "Exe");
        var nullable = Choice("Nullable", "disable", "enable", "disable");
        var implicitUsings = Choice("ImplicitUsings", "disable", "enable", "disable") == "enable";
        var warningsAsErrors = Choice("TreatWarningsAsErrors", "false", "true", "false") == "true";
        var version = Choice("LangVersion", "13.0", "12.0", "13.0") == "12.0" ? LanguageVersion.CSharp12 : LanguageVersion.CSharp13;
        var symbols = Get("DefineConstants", "").Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (symbols.Any(symbol => !SyntaxFacts.IsValidIdentifier(symbol) || symbol.StartsWith('@')))
            throw new InvalidOperationException("DefineConstants must contain semicolon-separated C# identifiers.");
        // These are predefined by a normal .NET 10 SDK build as well.
        symbols = symbols.Concat(new[] { "NET", "NET10_0", "NET10_0_OR_GREATER", "NETCOREAPP" }).Distinct().ToArray();
        return new LessonProject(
            new CSharpParseOptions(version, preprocessorSymbols: symbols),
            new CSharpCompilationOptions(OutputKind.ConsoleApplication,
                optimizationLevel: OptimizationLevel.Debug, concurrentBuild: false,
                nullableContextOptions: nullable == "enable" ? NullableContextOptions.Enable : NullableContextOptions.Disable,
                generalDiagnosticOption: warningsAsErrors ? ReportDiagnostic.Error : ReportDiagnostic.Default),
            implicitUsings, projects.FirstOrDefault().Key);
    }

    private static readonly HashSet<string> SupportedProperties = new()
    {
        "TargetFramework", "OutputType", "Nullable", "ImplicitUsings", "LangVersion", "DefineConstants", "TreatWarningsAsErrors"
    };
}
