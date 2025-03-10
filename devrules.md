# General Development Rules

You should do task-based development. For every task, you should write the tests, implement the code, and run the tests to make sure everything works. Use `dotnet test` to run the tests or use `dotnet test --filter "FullyQualifiedName~TypeConversionTests"` to run a specific test.

Please think step by step about whether there exists a less over-engineered and yet simpler, more elegant, and more robust solution to the problem that accords with KISS and DRY principles.

When the tests pass:
* Update the todo list to reflect the task being completed
* Update the memory file to reflect the current state of the project
* Fix any warnings or errors in the code
<!-- * Commit the changes to the repository with a descriptive commit message -->
* Update the development guidelines to reflect anything that you've learned while working on the project
* Stop and we will open a new chat for the next task

## Retain Memory

There will be a memory file for every project.

The memory file will provide context for the project, and any notes or relevant details you'd need to remember between chats.

Keep it up to date based on the project's current state. 

Do not annotate task completion in the memory file. It will be tracked in the to-do list.

## Update development guidelines

If necessary, update the development guidelines to reflect anything you've learned while working on the project.

## Environment Variables and Security

- Use environment variables for sensitive information like API keys and credentials
- Store environment variables in a .env file that is not committed to version control
- Use the dotenv package to load environment variables in Node.js applications
- Format environment variables as KEY=VALUE without quotes or JavaScript syntax
- Always provide fallback values when accessing environment variables
- Include example .env files (e.g., .env.example) in version control with placeholder values

## API Integration

- When using the Oxylabs E-Commerce Scraper API, use zip/postal codes (e.g., '10001' for New York, 'SW1A 1AA' for London) for the geo_location parameter
- Handle API errors gracefully with appropriate error messages and fallback mechanisms
- Include proper error handling for API requests to prevent application crashes
- Log API responses for debugging purposes
- When parsing API responses, implement robust property access paths with multiple fallback options
- Add detailed logging of API response structures to help diagnose parsing issues
- Use type checking and validation when extracting data from API responses
- Implement fallback values for all extracted properties to handle missing or malformed data
- Test API integrations with a variety of response formats to ensure robustness
