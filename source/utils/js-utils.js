export var regExpPatterns = (() => {

  const sentenceSplitter = /(?<!\b(?:[\w\d])[!¡?¿؟।।ฯ։።\.·…;។།ໃ་᠆᠉⸮⸘⸴፧᜵᜶ᝪᝫ᠃᠉᠊᠋᠌᠍᠆᠊᠋᠌᠍᠆᠊᠋᠌᠍⹀⹁⹂⹃⹄⹅⹆⹇⹈⹉⹊⹋⹌⹍⹎⹏⹐⹑⹒⹓⹔⹕⹖⹗⹘⹙⹚⹛⹜⹝⹞⹟⹠⹡⹢⹣⹤⹥⹦⹧⹨⹩⹪⹫⹬⹭⹮⹯⹰⹱⹲⹳⹴⹵⹶⹷⹸⹹⹺⹻⹼⹽⹾⹿;\n\r]\b)(?<!^[[!¡?¿؟।।ฯ։።\.·…;។།ໃ་᠆᠉⸮⸘⸴፧᜵᜶ᝪᝫ᠃᠉᠊᠋᠌᠍᠆᠊᠋᠌᠍᠆᠊᠋᠌᠍⹀⹁⹂⹃⹄⹅⹆⹇⹈⹉⹊⹋⹌⹍⹎⹏⹐⹑⹒⹓⹔⹕⹖⹗⹘⹙⹚⹛⹜⹝⹞⹟⹠⹡⹢⹣⹤⹥⹦⹧⹨⹩⹪⹫⹬⹭⹮⹯⹰⹱⹲⹳⹴⹵⹶⹷⹸⹹⹺⹻⹼⹽⹾⹿;\n\r])(?<=[!¡?¿؟।।ฯ։።\.·…;។།ໃ་᠆᠉⸮⸘⸴፧᜵᜶ᝪᝫ᠃᠉᠊᠋᠌᠍᠆᠊᠋᠌᠍᠆᠊᠋᠌᠍⹀⹁⹂⹃⹄⹅⹆⹇⹈⹉⹊⹋⹌⹍⹎⹏⹐⹑⹒⹓⹔⹕⹖⹗⹘⹙⹚⹛⹜⹝⹞⹟⹠⹡⹢⹣⹤⹥⹦⹧⹨⹩⹪⹫⹬⹭⹮⹯⹰⹱⹲⹳⹴⹵⹶⹷⹸⹹⹺⹻⹼⹽⹾⹿;\n\r](?=\s))/gi
  const bracketsContent = /\([^()]*\)|\[[^\[\]]*\]|\{[^{}]*\}/g;
  const sentenceDashes = /(?!(?<=\p{L})[\-–](?=\p{L}))[\-–]/gum;
  const sentenceQuotationMarks = /(?!(?<=\p{L})['’"`](?=\p{L}))['’"`]/gum;
  const sentenceGarbage = /(?!(?<=\p{L})['’"`\-–](?=\p{L}))[^\p{L}\d&.,Λ ]/gum;
  const extraSpaces = /(\s)+/g;

  return { bracketsContent, sentenceDashes, sentenceQuotationMarks, sentenceGarbage, extraSpaces };
})();

export function waitForElement(selector, context, options) {
  context = context || document;
  const { timeout, waitForMissing } = options || {};
  let timer;
  let observer;
  return new Promise((resolve, reject) => {

    let handleElement = () => {
      let condition = context?.querySelector(selector);
      if (waitForMissing ? !condition : condition) {
        resolve(waitForMissing ? true : condition || null);
        if (observer) observer.disconnect();
      }
    }

    handleElement();

    observer = new MutationObserver(mutations => {
      handleElement();
    });

    observer.observe(context, {
      childList: true,
      subtree: true
    });

    if (timeout) {
      const handleTimeout = () => {
        clearTimeout(timer);
        observer.disconnect();
        resolve(null);//new Error('Timeout waiting for element')
      };
      timer = setTimeout(handleTimeout, timeout);
    }
  });
}

export function CSSToObject(cssText) {
  var regex = /([\w-]*)\s*:\s*([^;]*)/g;
  var match, properties = {};
  while (match = regex.exec(cssText)) properties[match[1]] = match[2].trim();
  return properties;
}

export function objectToCSS(style) {
  return Object.entries(style).map(([k, v]) => `${k}:${v}`).join(';')
}


/**
 * Clamps a value to the nearest boundary within a specified range.
 * 
 * @param {number} value - The value to be clamped.
 * @param {[number, number]} range - An array representing the range [start, end].
 * @return {number} - The clamped value within the range.
 * @tags #math #utility
 */
export function clampToRange(value, range) {
  const [start, end] = range;

  if (value >= Math.min(start, end) && value <= Math.max(start, end)) {
    return value;
  } else if (Math.abs(value - start) < Math.abs(value - end)) {
    return start;
  } else {
    return end;
  }
}

export function onDocumentReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}


/**
 * Generates a random string of a specified length using a custom character set.
 * 
 * @param {number} i - The length of the random string to generate.
 * @param {string} [chars] - The character set to use for generating the string. Defaults to alphanumeric characters.
 * @returns {string} A random string of the specified length.
 * @tags #string #random #utility
 * @altname randomString
 */
export function getRandomString(i, chars) {
  chars = chars || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";//Math.random().toString(36).substring(2);
  var rnd = '';
  while (rnd.length < i) {
    rnd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rnd;
};


/**
 * Filters the properties of an object or elements of an array based on a callback function.
 * 
 * @param {Object|Array} obj - The object or array to filter.
 * @param {Function} filtercheck - A callback function that determines whether a property or element should be included. 
 * It receives `(key, value, index, array)` as arguments.
 * @return {Object|Array} - A new object or array containing only the filtered properties or elements.
 * @tags #object #array #filter #utility
 */
export function objectFilter(obj, filtercheck) {
  let isArray = Array.isArray(obj);
  let result = isArray ? [] : {};
  Object.keys(obj).forEach((key, i, array) => {
    if (filtercheck(key, obj[key], i, array)) {
      if (isArray) {
        result.push(obj[key]);
      } else {
        result[key] = obj[key];
      }
    };
  })
  return result;
};



/**
 * Compares multiple strings in a case-insensitive and format-independent manner.
 * 
 * @param {...string} strings - The strings to compare.
 * @return {boolean} - `true` if all strings are equivalent, otherwise `false`.
 * @tags #string #comparison #utility
 */
export function caseIndependentCompare(...strings) {
  if (strings.length < 2) {
    return false;
  }

  for (let i = 1; i < strings.length; i++) {
    let parseString = (str) => str.split(/(?<!\p{Lu})(?=\p{Lu})|-| |_|\./gum).filter(item => item && !/^[^\p{L}\d]$/ui.test(item));
    let formatStringArray = (arr) => arr.join('').toLowerCase();
    if (formatStringArray(parseString(strings[i])) !== formatStringArray(parseString(strings[0]))) {
      return false;
    }
  }

  return true;
}


/**
 * Sorts an array of objects based on specified rules and an optional sorting function.
 *
 * @param {Array<Object>} array - The array of objects to sort.
 * @param {Array<Object|string>|Object|string} rules - Sorting rules, which can be an array of rules or a single rule.
 * @param {Function} [sortFunction] - An optional sorting function to use instead of the default Array.sort().
 * @returns {Array<Object>} A new array of objects sorted according to the specified rules.
 * @tags #array #object #sorting #converter
 * @altname multiSort
 */
export function sortArrayOfObjects(array, rules, sortFunction) {
  const newArray = [...array];
  sortFunction = sortFunction || ((arr, fn) => arr.sort(fn));
  const sortingRules = Array.isArray(rules) ? rules : [rules];

  return sortFunction(newArray, (a, b) => {
    for (let rule of sortingRules) {
      let result = 0;
      let direction = 'asc';

      if (typeof rule === 'object') {
        // Defining the sorting direction
        if (rule.order === 'desc') direction = 'desc';
        if (rule.order === 'asc') direction = 'asc';

        if (rule.negative) {
          // Invert the direction if negative is set
          direction = direction === 'asc' ? 'desc' : 'asc';
        }

        const dir = direction === 'asc' ? 1 : -1;

        if ('func' in rule && typeof rule.func === 'function') {
          result = dir * (Number(rule.func(a, b)) || 0);
        } else if ('field' in rule) {
          const field = rule.field;
          const isDate = rule.isDate;
          const isNumber = rule.isNumber;
          const ignoreCase = rule.ignoreCase;

          let aValue = a?.[field];
          let bValue = b?.[field];

          if (isDate) {
            aValue = aValue ? new Date(aValue) : new Date(0);
            bValue = bValue ? new Date(bValue) : new Date(0);
          } else if (isNumber) {
            aValue = Number(String(aValue).replace(/\D/g, ''));
            bValue = Number(String(bValue).replace(/\D/g, ''));
          } else if (ignoreCase && typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (aValue > bValue) {
            result = dir;
          } else if (aValue < bValue) {
            result = -dir;
          }
        }
      } else if (typeof rule === 'string') {
        let dir = 1;
        if (rule[0] === '-') {
          dir = -1;
          rule = rule.substring(1);
        }
        const field = rule;
        let aValue = a?.[field];
        let bValue = b?.[field];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue > bValue) {
          result = dir;
        } else if (aValue < bValue) {
          result = -dir;
        }
      }

      if (result !== 0) {
        return result;
      }
    }
    return 0;
  });
}


/**
 * JSON.stringify with custom per-path formatters.
 * @param {Object} obj
 * @param {Object<string, Function>} [formatters={}]
 * @param {number} [space=2]
 * @returns {string}
 */
export function stringifyCustom(obj, formatters = {}, space) {
  space = space == undefined ? 2 : space;
  function get(obj, key) {
    return obj[key];
  }

  function createMarker(id) {
    return `__FORMATTER_${id}__`;
  }

  const formatterEntries = Object.entries(formatters)
    .sort((a, b) =>
      b[0].split('.').length -
      a[0].split('.').length
    );

  const markers = new Map();

  let markerId = 0;

  function cloneWithMarkers(current, currentPath = '') {

    if (Array.isArray(current)) {
      return current.map((item, index) =>
        cloneWithMarkers(
          item,
          currentPath
            ? `${currentPath}.${index}`
            : `${index}`
        )
      );
    }

    if (
      current &&
      typeof current === 'object'
    ) {

      const result = {};

      for (const key of Object.keys(current)) {

        const fullPath = currentPath
          ? `${currentPath}.${key}`
          : key;

        const formatterEntry = formatterEntries.find(
          ([path]) => path === fullPath
        );

        if (formatterEntry) {

          /** @type {Function} */
          const formatterFn = formatterEntry?.[1];

          const marker = createMarker(markerId++);

          markers.set(
            marker,
            formatterFn?.['call'](this,
              get(obj, fullPath),
              fullPath,
              obj
            )
          );

          result[key] = marker;

        } else {
          result[key] = cloneWithMarkers(
            current[key],
            fullPath
          );
        }
      }

      return result;
    }

    return current;
  }

  const prepared = cloneWithMarkers(obj);

  return JSON.stringify(prepared, null, space)
    .replace(
      /"__FORMATTER_\d+__"/g,
      (match) => {
        const marker = match.slice(1, -1);

        return markers.get(marker);
      }
    );
}

/**
 * Matches a URL against one or more URL patterns, supporting wildcard (`*`) matching.
 * 
 * @param {string} url - The URL to test.
 * @param {string | string[]} urlPatterns - A single pattern or an array of patterns to match against.
 * @return {boolean} - `true` if the URL matches any of the patterns, otherwise `false`.
 * @tags #url #matching #utility
 */
export function matchURLPatterns(url, urlPatterns) {

  function escapeString(str, slashLength = 2) {
    return str.replace(new RegExp('[-[\\]{}()*+?&.,\\\\^$|#\'\"]', 'gim'), (`${[...new Array(slashLength)].map(i => '\\').join('')}$&`));
  };

  urlPatterns = typeof urlPatterns == 'string' ? [urlPatterns] : urlPatterns || [];

  return urlPatterns?.some(pattern => {
    return url.match(new RegExp('^' + escapeString(pattern, 1).replace(/\\\*/gim, '.*') + '$', ''));
  });
}


/**
 * Parses a URL string into its components, such as protocol, hostname, pathname, query parameters, and more.
 * 
 * @param {string} str - The URL string to parse.
 * @return {Object} - An object containing the parsed components of the URL.
 * @tags #url #parsing #utility
 */
export function parseURL(str) {
  const parseUrl = /^(?<href>(?:(?<scheme>(?:view-source|blob):))?(?<protocol>(?:http|https|ftp|ftps|file|urn|chrome|browser|chrome-extension|moz-extension|chrome-error|devtools|view-source|about|javascript|data|postgres|mysql|ws|wss|[A-Za-z][A-Za-z0-9+.\-]*)(?<!localhost\b):(?=[^\s]+))(?:(?:(?:\/\/)?(?<auth>(?<username>(?:[A-Za-z0-9._~!$&'()*+,;=\-]|%[0-9A-Fa-f]{2})*)(?::(?<password>(?:[A-Za-z0-9._~!$&'()*+,;=:\-]|%[0-9A-Fa-f]{2})*))?@)?(?<host>(?<hostname>(?<=\/\/|@)(?:(?<ip>\d{1,3}(?:\.\d{1,3}){3}(?![.\d]))|(?![\p{N}.]{1,3}\.)(?:(?:(?<subdomains>(?:[\p{L}\p{N}\p{S}][\p{L}\p{N}\p{S}\p{M}\-]*[\p{L}\p{N}\p{S}\p{M}]?\.)*)?(?<secondLevelDomain>[\p{L}\p{N}\p{S}](?:[\p{L}\p{N}\p{S}\p{M}\-]*[\p{L}\p{N}\p{S}\p{M}])?)\.(?<topLevelDomain>(?=[\p{L}\p{N}\p{S}\p{M}\-]*\p{L})[\p{L}\p{N}\p{S}](?:[\p{L}\p{N}\p{S}\p{M}\-]*[\p{L}\p{N}\p{S}\p{M}])?))|(?:[\p{L}\p{N}\p{S}\p{M}\-]*[\p{L}\p{N}\p{S}\p{M}])))(?=[^\p{L}\p{N}_]|$))?(?::(?<port>\d+))?)?(?<!\/\/\b|@|-|\.)(?<pathname>(?!\/\/|-|\.)(?:\/{0,}[-,\/%_.~+()'"&@:;\p{L}\p{N}\p{S}\p{M}\p{Pc}\p{Pd} ]+)+)?(?:(?<search>\?[:;&\p{L}\d%_.,~+=\-\/ ()]*))?(?:(?<hash>#[\p{L}\d_\-\?&=]*))?)))$/gum;

  const regex = parseUrl;
  const match = regex.exec(str);
  if (!match) return null;

  const g = match.groups;

  const obj = {
    href: g.href,//http://a:b@www.example.com:123/foo/bar.html?fox=trot#foo
    origin: g.host
      ? `${g.scheme || ''}${g.protocol}//${g.username ? g.username + (g.password ? ':' + g.password : '') + '@' : ''}${g.host}${g.port ? ':' + g.port : ''}`
      : null, //http://a:b@www.example.com:123 (with username and password)
    protocol: g.protocol, //http 
    scheme: g.scheme, //view-source: (deprecated)
    auth: g.scheme, //a:b@ (deprecated)
    username: g.username, //a
    password: g.password, //b
    host: g.host, //www.example.com:123
    hostname: g.hostname, //www.example.com
    ip: g.ip, //123.123.123.123 (deprecated)
    subdomain: g.subdomains ? g.subdomains?.split('.')?.[0] : undefined, //www (deprecated)
    subdomains: g.subdomains, //www. (deprecated)
    domain: g.secondLevelDomain && g.topLevelDomain
      ? `${g.secondLevelDomain}.${g.topLevelDomain}`
      : null, //example.com (deprecated)
    domainName: g.secondLevelDomain, //example (deprecated)
    topLevelDomain: g.topLevelDomain, //com (deprecated)
    port: g.port, //123
    pathname: g.pathname, // /foo/bar.html
    queryParams: g.search ? g.search.slice(1) : undefined, //fox=trot 
    hash: g.hash ? g.hash.slice(1) : undefined // foo
  };

  return obj;
}


/**
 * Splits a string into two parts at the first occurrence of a specified substring or regular expression.
 * 
 * @param {string} string - The string to split.
 * @param {string | RegExp} regexpOrSubstr - The substring or regular expression to split on.
 * @return {string[]} - An array containing the two parts of the string.
 * @tags #string #split #utility
 */
export function splitFirst(string, regexpOrSubstr) {
  let specialSymbol = '¬';
  return string.replace(regexpOrSubstr, specialSymbol).split(specialSymbol);
}

/**
 * Returns the element with the maximum string length from an array.
 *
 * @param {string[]} arr - An array of strings.
 * @returns {string} The longest string in the array.
 *
 * @throws {TypeError} If the array is empty or contains non-string values.
 */
export function longestElement(arr) {
  if (arr.length === 0) return undefined;
  return arr?.reduce((longest, current) =>
    current.length > longest.length ? current : longest
  );
}

/**
 * Returns the element with the minimum string length from an array.
 *
 * @param {string[]} arr - An array of strings.
 * @returns {string} The shortest string in the array.
 *
 * @throws {TypeError} If the array is empty or contains non-string values.
 */
export function shortestElement(arr) {
  if (arr.length === 0) return undefined;
  return arr.reduce((shortest, current) =>
    current.length < shortest.length ? current : shortest
  );
}

/**
 * Converts a string to Sentence case format.
 * 
 * @param {string} str - The input string to convert.
 * @return {string} - The converted string in Sentence case.
 * @tags #string #conversion #utility
 */
export function toSentenceCase(str) {
  let parsedStringArray = str.split(/(?<!\p{Lu})(?=\p{Lu})|-| |_|\./gum).filter(item => item && !/^[^\p{L}\d]$/ui.test(item));
  var result = parsedStringArray.join(' ').toLowerCase();
  return capitalizeFirstLetter(result);
}

/**
 * Capitalizes the first letter of a string.
 * 
 * @param {string} string - The input string.
 * @return {string} - The transformed string.
 * @tags #string #utility
 * @altname upperFirstCase deCap
 */
export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


/**
 * Creates a regular expression from a string, escaping special characters.
 * 
 * @param {string} value - The string to convert into a regular expression.
 * @return {RegExp} - The resulting regular expression.
 * @tags #regex #utility
 */
export function getMatchesRegExp(value) {
  var regStr = value.replace(new RegExp('[\\\\]', 'gim'), '\$&');
  var regExp = new RegExp(regStr, 'gim');
  return regExp;
}

/**
 * Retrieves a nested value from an object using a dot-separated key path.
 * Supports wildcard/regular expression matching and non-enumerable properties.
 *
 * Examples:
 *   getNestedValue(obj, "foo.bar");
 *   getNestedValue(obj, "foo.*__bar", { regExp: true });
 *   getNestedValue(obj, "foo.*__bar", {
 *     regExp: true,
 *     ownPropertyNames: true
 *   });
 *
 * @param {Object} obj
 * @param {string} key
 * @param {Object} [options]
 * @param {boolean} [options.regExp=false] Enable RegExp matching for path segments.
 * @param {boolean} [options.ownPropertyNames=false] Include non-enumerable properties.
 * @param {boolean} [options.symbols=false] Include Symbol keys (uses Reflect.ownKeys()).
 * @returns {any}
 */
export function getNestedValue(obj, key, options) {
  const {
    regExp = false,
    ownPropertyNames = false,
    symbols = false
  } = options || {};

  return key.split(".").reduce((result, part) => {
    if (result == null) {
      return undefined;
    }

    if (!regExp) {
      return result[part];
    }

    const keys = symbols
      ? Reflect.ownKeys(result)
      : ownPropertyNames
        ? Object.getOwnPropertyNames(result)
        : Object.keys(result);

    const regexp = getMatchesRegExp(
      part.replace(/\*/g, ".*")
    );

    const matchedKey = keys.find(k =>
      typeof k === "string" && regexp.test(k)
    );

    return matchedKey === undefined
      ? undefined
      : result[matchedKey];
  }, obj);
}