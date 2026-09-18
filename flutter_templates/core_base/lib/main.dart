import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_markdown/flutter_markdown.dart';

void main() {
  runApp(const DynamicApp());
}

class AppConfig {
  final String title;
  final String themeColor;
  final String content;
  final List<dynamic> items;

  AppConfig({
    required this.title,
    required this.themeColor,
    required this.content,
    required this.items,
  });

  factory AppConfig.fromJson(Map<String, dynamic> json) {
    return AppConfig(
      title: json['title'] ?? 'Dynamic App',
      themeColor: json['themeColor'] ?? '#2196F3',
      content: json['content'] ?? '',
      items: json['items'] ?? [],
    );
  }
}

class DynamicApp extends StatefulWidget {
  const DynamicApp({super.key});

  @override
  State<DynamicApp> createState() => _DynamicAppState();
}

class _DynamicAppState extends State<DynamicApp> {
  AppConfig? _config;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadConfig();
  }

  Future<void> _loadConfig() async {
    try {
      final jsonString = await rootBundle.loadString('assets/config.json');
      final jsonData = json.decode(jsonString);
      setState(() {
        _config = AppConfig.fromJson(jsonData);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _config = AppConfig(
          title: 'Error',
          themeColor: '#F44336',
          content: 'Failed to load configuration.',
          items: [],
        );
        _isLoading = false;
      });
    }
  }

  Color _hexToColor(String code) {
    return Color(int.parse(code.substring(1, 7), radix: 16) + 0xFF000000);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const MaterialApp(
        home: Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    final themeColor = _hexToColor(_config!.themeColor);

    return MaterialApp(
      title: _config!.title,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: themeColor),
        useMaterial3: true,
      ),
      home: AppHomePage(config: _config!),
    );
  }
}

class AppHomePage extends StatelessWidget {
  final AppConfig config;

  const AppHomePage({super.key, required this.config});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(config.title),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              MarkdownBody(data: config.content),
              const SizedBox(height: 24),
              if (config.items.isNotEmpty) ...[
                Text(
                  'Features',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: config.items.length,
                  itemBuilder: (context, index) {
                    final item = config.items[index];
                    return Card(
                      child: ListTile(
                        leading: const Icon(Icons.star),
                        title: Text(item['title'] ?? ''),
                        subtitle: Text(item['description'] ?? ''),
                      ),
                    );
                  },
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
