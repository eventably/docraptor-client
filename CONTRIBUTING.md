
# Contributing to DocRaptor Client

We welcome contributions to the DocRaptor Client project! Below are the guidelines for contributing to this project.

## Gitflow Workflow

We follow the Gitflow workflow for branching and merging. Here is a summary of the workflow:

1. **Master Branch**: The master branch contains the production-ready code.
2. **Develop Branch**: The develop branch contains the latest development changes.

### Branching

- **Feature Branches**: Create a new branch from the develop branch for each feature or bugfix.
  - Naming convention: `feature/feature-name` or `bugfix/bugfix-description`
- **Release Branches**: When preparing for a new release, create a release branch from the develop branch.
  - Naming convention: `release/version-number`
- **Hotfix Branches**: For critical fixes that need to go directly into production, create a hotfix branch from the master branch.
  - Naming convention: `hotfix/fix-description`

### Merging

- Merge feature branches into the develop branch.
- Merge release branches into both the develop and master branches.
- Merge hotfix branches into both the develop and master branches.

## Testing

We use Jest and Supertest for testing. Ensure that all new features and bug fixes are covered by tests. Tests should be written in the `tests` directory.

### Running Tests

To run the tests:

```sh
npm run test
```

### Test Guidelines

- Write tests that cover all possible scenarios.
- Do not use mocks; tests should interact with real services and resources.
- Ensure tests clean up any resources they create (e.g., test files should be deleted rather than saved).

## Submitting Changes

1. Fork the repository.
2. Create a new feature branch from the develop branch.
3. Implement your changes.
4. Write tests to cover your changes.
5. Ensure all tests pass.
6. Commit your changes with a descriptive commit message.
7. Push your branch to your fork.
8. Submit a pull request to the develop branch.

## Code of Conduct

Please adhere to the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct/). Any violations will be dealt with accordingly.

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.
