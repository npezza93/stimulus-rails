import { Application } from "stimulus"

const application = Application.start()
const { controllerAttribute } = application.schema

const loaded = {}

function autoload() {
  for (const element of document.querySelectorAll(`[${controllerAttribute}]`)) {
    autoloadControllers(element)
  }
}

function autoloadControllers(element) {
  const controllerTokens = element.getAttribute(controllerAttribute) || ""
  const controllerNames = controllerTokens.split(/\s+/).filter(content => content.length)

  for (const controllerName of controllerNames) {
    const filename = controllerName.replace(/--/g, "/").replace(/-/g, "_")
    import(`${filename}_controller`).then((controllerModule) => {
      console.log(controllerModule)
      if (controllerName in loaded) return

      application.register(controllerName, controllerModule.default)

      loaded[controllerName] = true
    }).catch((error) => {
      window.loaderError = error
      console.log(`${error} Failed to autoload controller: ${controllerName}`)
    });
  }
}

new MutationObserver((mutationsList) => {
  mutationsList.forEach(({ attributeName, target }) => {
    if (attributeName == controllerAttribute && target.hasAttribute(attributeName)) {
      autoloadControllers(target)
    }
  })
}).observe(document.body, { attributeFilter: [controllerAttribute], subtree: true, childList: true })

autoload()
