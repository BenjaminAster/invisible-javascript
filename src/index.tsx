
import { css, type Config as WinzigConfig } from "winzig";

winzigConfig: ({
	output: "../",
	appfiles: "appfiles",
	css: "./main.css",
	noCSSScopeRules: true,
}) satisfies WinzigConfig;

const storagePrefix = location.pathname + ":";

const ThemeToggle = (() => {
	const themeInStorage = localStorage.getItem(storagePrefix + "theme");
	const mediaMatch = window.matchMedia("(prefers-color-scheme: light)");
	let lightTheme$ = (themeInStorage === "auto" && mediaMatch.matches) || themeInStorage === "light";
	mediaMatch.addEventListener("change", ({ matches }) => lightTheme$ = matches);
	$: {
		const themeString = lightTheme$ ? "light" : "dark";
		localStorage.setItem(
			storagePrefix + "theme",
			(lightTheme$ === mediaMatch.matches) ? "auto" : themeString
		);
		document.documentElement.dataset.theme = themeString;
	}

	return () => <button on:click={() => lightTheme$ = !lightTheme$}>
		Switch to {lightTheme$ ? "dark" : "light"} theme
		{css`
			& {
				color: light-dark(#444, #ccc);
			}
		`}
	</button>;
})();

let codeOutput$ = "";
const hangulCharacters = "\u115F\u1160\u3164\uFFA0";

const scriptPreface = [
	`// static payload:`,
	`\n`,
	`s="";`,
	`for(let i=0;i<4**7;++i)`,
	`Reflect.defineProperty(`,
	`self,`,
	`[...i.toString(4)].map(n=>"${hangulCharacters}"[n]).join(""),`,
	`{get(){i?s+=String.fromCharCode(i>>7,i&127):eval(s)}})`,
	`\n`,
	`// invisible code below:`,
].join("");

const handleInput = () => {
	code = scriptPreface;
	for (let i = 0; i < textarea.value.length;) {
		const charCode1 = textarea.value.charCodeAt(i++);
		const charCode2 = textarea.value.charCodeAt(i++) || 32;
		if (charCode1 < 32 || charCode1 > 126 || charCode2 < 32 || charCode2 > 126) {
			codeOutput$ = `Input string contains invalid characters. Please only use characters in the Unicode range U+0020 (SPACE) through U+007E (TILDE)`;
			return;
		}
		const number = charCode1 * 128 + charCode2;
		const hangulString = [...number.toString(4).padStart(7, "0")].map(char => hangulCharacters[+char]).join("");
		code += "\n" + hangulString;
	}
	code += "\n" + hangulCharacters[0] + "\n// end of invisible code\n";
	codeOutput$ = code;
};

let code = "";
let textarea = <textarea on:input={handleInput} defaultValue='console.log("Hello")' spellcheck={false} name="code-input" ariaLabel="Code input">
	{css`
		& {
			inline-size: -moz-available;
			inline-size: -webkit-fill-available;
			inline-size: stretch;
			field-sizing: content;
			min-block-size: 3lh;
			max-block-size: 10lh;
			padding: .3em .4em;
			background-color: light-dark(#eee, #222);
			border: 1px solid light-dark(#ddd, #333);
			border-radius: .2em;
			outline: none;
			font-family: monospace;
		}

		&:focus-visible {
			border-color: light-dark(#bbb, #555);
		}
	`}
</textarea> as HTMLTextAreaElement;

handleInput();

const title = "Invisible JavaScript";

;
<html lang="en">
	<head>
		<title>{title}</title>
		<meta attr:property="og:title" content={title} />
		<meta name="description" content="Execute invisible JavaScript by abusing Hangul filler characters." />
		<link rel="code-repository" href="https://github.com/BenjaminAster/invisible-javascript" />
		<meta attr:property="og:image" content="https://benjaminaster.com/invisible-javascript/assets/console-log-hello.png" />
		<meta name="twitter:card" content="summary_large_image" />
		<link rel="icon" href="./assets/icon.svg" />

		<script type="module">{[
			``,
			`if (!CSS.supports("(color: light-dark(red, tan))")) if (localStorage.getItem(\`\${location.pathname}:force\`) !== "true") {`,
			`\tlocation.assign("/update-your-browser/?source=" + location.pathname);`,
			`}`,
			``,
		].join("\n")}</script>
	</head>
	<body>
		<main>
			<h1>{title}</h1>

			<p>
				Execute invisible JavaScript by abusing Hangul filler characters.
				Inspired by <a href="https://x.com/aemkei">Martin Kleppe</a>'s <a href="https://aem1k.com/invisible/">INVISIBLE.js</a>.
			</p>

			<p>Type or paste some JavaScript code below:</p>

			{textarea}

			<button on:click={() => navigator.clipboard.writeText(code)}>
				Copy code
				{css`
					& {
						padding: .1em .5em;
						background-color: light-dark(#ddd, #333);
						border-radius: .15em;
						margin-block: .5rem;
					}

					&:active {
						background-color: light-dark(#eee, #222);
					}
				`}
			</button>

			<output>
				{codeOutput$}
				{css`
					& {
						display: block;
						font-family: monospace;
						white-space-collapse: preserve;
						max-block-size: 17lh;
						overflow-y: auto;
					}
				`}
			</output>

			{css`
				& {
					padding-inline: 1rem;
					flex-grow: 1;
				}
			`}
		</main>

		<footer>
			<a href="https://github.com/BenjaminAster/invisible-javascript">View source code</a>
			<div className="space" />

			<ThemeToggle />

			{css`
				& {
					display: flex;
					font-size: .9rem;
					flex-wrap: wrap;
					column-gap: 1rem;
					padding: .2rem .6rem;
					background-color: light-dark(#eee, #222);
				}

				.space {
					flex-grow: 1;
				}
			`}
		</footer>
	</body>
</html>;
