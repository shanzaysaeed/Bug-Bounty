/**
 * @name Missing Rehype Sanitize in React Markdown
 * @description React Markdown without rehype-sanitize can lead to XSS vulnerabilities
 * @kind problem
 * @problem.severity error
 * @security-severity 8.0
 * @precision high
 * @id js/react-markdown-missing-sanitize
 * @tags security
 *       xss
 */

import javascript

/**
 * Identifies ReactMarkdown import statements
 */
class ReactMarkdownImport extends ImportDeclaration {
  ReactMarkdownImport() {
    this.getImportedPath().getValue() = "react-markdown"
  }
}

/**
 * Identifies rehype-sanitize import statements
 */
class RehypeSanitizeImport extends ImportDeclaration {
  RehypeSanitizeImport() {
    this.getImportedPath().getValue() = "rehype-sanitize"
  }
}

/**
 * Checks if a ReactMarkdown JSX element has rehype-sanitize in its rehypePlugins prop
 */
predicate hasRehypeSanitizePlugin(JSXElement reactMarkdownElem) {
  exists(JSXAttribute attr |
    attr = reactMarkdownElem.getAttributeByName("rehypePlugins") and
    attr.toString().regexpMatch(".*rehypeSanitize.*")
  )
}

from File file, ReactMarkdownImport rmImport, JSXElement reactMarkdownElem
where
  rmImport.getFile() = file and
  reactMarkdownElem.getFile() = file and
  reactMarkdownElem.getName() = "ReactMarkdown" and
  not hasRehypeSanitizePlugin(reactMarkdownElem) and
  // Check if rehype-sanitize is imported in this file
  exists(ImportDeclaration imp | 
    imp.getFile() = file and 
    imp instanceof RehypeSanitizeImport
  )
select reactMarkdownElem, "ReactMarkdown is used without rehype-sanitize plugin, which may lead to XSS vulnerabilities." 
