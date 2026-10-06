<?php
/**
 * Plugin Name: Nutzen Switch
 * Description: Central de diagnóstico, módulos e conexões da plataforma NutzenPet.
 * Version: 0.4.11
 * Author: NutzenPet
 * Requires at least: 6.7
 * Requires PHP: 8.1
 * WC requires at least: 9.0
 * WC tested up to: 11.1
 * Text Domain: nutzen-switch
 */

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Utilities\FeaturesUtil;

final class Nutzen_Switch_Plugin {
	private const VERSION = '0.4.11';
	private const OPTION = 'nutzen_switch_settings';
	private const LOG    = 'nutzen_switch_log';
	private const ADMIN_CSS_BASE64 = 'OnJvb3QgewogIC0tbnV0emVuLXB1cnBsZTogIzNlMTI1NTsKICAtLW51dHplbi1wdXJwbGUtZGFyazogIzI1MGEzNTsKICAtLW51dHplbi1saWxhYzogI2Y1ZWZmODsKICAtLW51dHplbi1vcmFuZ2U6ICNmZThjMDU7CiAgLS1udXR6ZW4tdGVhbDogIzEyNGQ1NTsKfQoKI3dwYWRtaW5iYXIgeyBiYWNrZ3JvdW5kOiB2YXIoLS1udXR6ZW4tcHVycGxlLWRhcmspOyB9CiNhZG1pbm1lbnUsICNhZG1pbm1lbnV3cmFwLCAjYWRtaW5tZW51YmFjayB7IGJhY2tncm91bmQ6IHZhcigtLW51dHplbi1wdXJwbGUpOyB9CiNhZG1pbm1lbnUgYSB7IGNvbG9yOiByZ2JhKDI1NSwyNTUsMjU1LC44NCk7IH0KI2FkbWlubWVudSAud3AtaGFzLWN1cnJlbnQtc3VibWVudSAud3Atc3VibWVudSwgI2FkbWlubWVudSAud3AtaGFzLWN1cnJlbnQtc3VibWVudS5vcGVuc3ViIC53cC1zdWJtZW51LCAjYWRtaW5tZW51IC53cC1zdWJtZW51IHsgYmFja2dyb3VuZDogdmFyKC0tbnV0emVuLXB1cnBsZS1kYXJrKTsgfQojYWRtaW5tZW51IC53cC1oYXMtY3VycmVudC1zdWJtZW51ID4gYS5tZW51LXRvcCwgI2FkbWlubWVudSAuY3VycmVudCA+IGEubWVudS10b3AsICNhZG1pbm1lbnUgYTpob3ZlciwgI2FkbWlubWVudSBsaS5tZW51LXRvcDpob3ZlciwgI2FkbWlubWVudSBsaS5vcGVuc3ViID4gYS5tZW51LXRvcCB7IGJhY2tncm91bmQ6ICM1NjFiNzA7IGNvbG9yOiAjZmZmOyB9CiNhZG1pbm1lbnUgLndwLW1lbnUtaW1hZ2U6YmVmb3JlLCAjYWRtaW5tZW51IC53cC1zdWJtZW51IGE6Zm9jdXMsICNhZG1pbm1lbnUgLndwLXN1Ym1lbnUgYTpob3ZlciB7IGNvbG9yOiAjZmZkMzljOyB9Ci53cC1jb3JlLXVpIC5idXR0b24tcHJpbWFyeSB7IGJvcmRlci1jb2xvcjogdmFyKC0tbnV0emVuLW9yYW5nZSk7IGJhY2tncm91bmQ6IHZhcigtLW51dHplbi1vcmFuZ2UpOyBjb2xvcjogI2ZmZjsgfQoud3AtY29yZS11aSAuYnV0dG9uLXByaW1hcnk6aG92ZXIsIC53cC1jb3JlLXVpIC5idXR0b24tcHJpbWFyeTpmb2N1cyB7IGJvcmRlci1jb2xvcjogI2NjNjMyYjsgYmFja2dyb3VuZDogI2NjNjMyYjsgfQoud3AtY29yZS11aSAuYnV0dG9uOmZvY3VzLCBhOmZvY3VzLCBpbnB1dDpmb2N1cywgc2VsZWN0OmZvY3VzLCB0ZXh0YXJlYTpmb2N1cyB7IGJveC1zaGFkb3c6IDAgMCAwIDFweCB2YXIoLS1udXR6ZW4tcHVycGxlKTsgfQphIHsgY29sb3I6IHZhcigtLW51dHplbi1wdXJwbGUpOyB9CmE6aG92ZXIsIGE6Zm9jdXMgeyBjb2xvcjogIzZmMzE4OTsgfQoKLm51dHplbi1hZG1pbiB7IG1heC13aWR0aDogMTE4MHB4OyB9Ci5udXR6ZW4tYWRtaW4taGVybyB7IGRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6c3BhY2UtYmV0d2VlbjsgZ2FwOjI0cHg7IG1hcmdpbjoyMHB4IDA7IHBhZGRpbmc6MzBweDsgYm9yZGVyLXJhZGl1czo4cHg7IGNvbG9yOiNmZmY7IGJhY2tncm91bmQ6dmFyKC0tbnV0emVuLXB1cnBsZSk7IGJveC1zaGFkb3c6MCAxOHB4IDQ1cHggcmdiYSg2MiwxOCw4NSwuMTYpOyB9Ci5udXR6ZW4tYWRtaW4taGVybyBoMSB7IG1hcmdpbjo1cHggMCA4cHg7IGNvbG9yOiNmZmY7IGZvbnQtc2l6ZTozMnB4OyBmb250LXdlaWdodDo4MDA7IH0KLm51dHplbi1hZG1pbi1oZXJvIHAgeyBtYXJnaW46MDsgY29sb3I6cmdiYSgyNTUsMjU1LDI1NSwuNzUpOyB9Ci5udXR6ZW4tYWRtaW4taGVybyAuYnV0dG9uIHsgZGlzcGxheTppbmxpbmUtZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBtaW4taGVpZ2h0OjQycHg7IHBhZGRpbmc6MCAyMnB4OyB9Ci5udXR6ZW4ta2lja2VyIHsgbWFyZ2luOjA7IGNvbG9yOnZhcigtLW51dHplbi1vcmFuZ2UpOyBmb250LXNpemU6MTBweDsgZm9udC13ZWlnaHQ6ODAwOyBsZXR0ZXItc3BhY2luZzouMThlbTsgfQoubnV0emVuLXN0YXQtZ3JpZCB7IGRpc3BsYXk6Z3JpZDsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOnJlcGVhdChhdXRvLWZpdCxtaW5tYXgoMTUwcHgsMWZyKSk7IGdhcDoxMHB4OyBtYXJnaW46MTRweCAwOyB9Ci5udXR6ZW4tc3RhdC1ncmlkIGEsIC5udXR6ZW4tc3RhdC1ncmlkIGFydGljbGUgeyBkaXNwbGF5OmZsZXg7IG1pbi1oZWlnaHQ6NzhweDsgZmxleC1kaXJlY3Rpb246Y29sdW1uOyBqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyBwYWRkaW5nOjE0cHggMTZweDsgYm9yZGVyOjFweCBzb2xpZCAjZTVkOGViOyBib3JkZXItcmFkaXVzOjdweDsgYmFja2dyb3VuZDojZmZmOyBjb2xvcjp2YXIoLS1udXR6ZW4tdGVhbCk7IHRleHQtZGVjb3JhdGlvbjpub25lOyB0cmFuc2l0aW9uOnRyYW5zZm9ybSAuMnMgZWFzZSwgYm94LXNoYWRvdyAuMnMgZWFzZSwgYm9yZGVyLWNvbG9yIC4ycyBlYXNlOyB9Ci5udXR6ZW4tc3RhdC1ncmlkIGE6aG92ZXIgeyB0cmFuc2Zvcm06dHJhbnNsYXRlWSgtMnB4KTsgYm9yZGVyLWNvbG9yOiNjOGFjZDU7IGJveC1zaGFkb3c6MCAxMHB4IDI0cHggcmdiYSg2MiwxOCw4NSwuMSk7IH0KLm51dHplbi1zdGF0LWdyaWQgc3Ryb25nIHsgY29sb3I6dmFyKC0tbnV0emVuLXB1cnBsZSk7IGZvbnQtc2l6ZToyNXB4OyBsaW5lLWhlaWdodDoxOyB9Ci5udXR6ZW4tc3RhdC1ncmlkIHNwYW4geyBtYXJnaW4tdG9wOjdweDsgY29sb3I6IzVkNjg3MjsgZm9udC1zaXplOjEycHg7IGZvbnQtd2VpZ2h0OjYwMDsgfQoubnV0emVuLXN0YXQtZ3JpZC0tcGFnZSB7IG1hcmdpbjowIDAgMjhweDsgfQoubnV0emVuLXF1aWNrLWFjdGlvbnMgeyBkaXNwbGF5OmZsZXg7IGZsZXgtd3JhcDp3cmFwOyBnYXA6OHB4OyBtYXJnaW4tdG9wOjE0cHg7IH0KLm51dHplbi1zdGF0dXMtdGFibGUsIC5udXR6ZW4tc2V0dGluZ3MtY2FyZCwgLm51dHplbi1sb2cgeyBtYXgtd2lkdGg6MTAwJTsgYm9yZGVyOjFweCBzb2xpZCAjZTVkOGViOyBib3JkZXItcmFkaXVzOjdweDsgYmFja2dyb3VuZDojZmZmOyBib3gtc2hhZG93OjAgOHB4IDI0cHggcmdiYSg2MiwxOCw4NSwuMDUpOyB9Ci5udXR6ZW4tc3RhdHVzLXRhYmxlIHsgbWFyZ2luOjEycHggMCAyOHB4OyBvdmVyZmxvdzpoaWRkZW47IH0KLm51dHplbi1zZXR0aW5ncy1jYXJkIHsgcGFkZGluZzoyNHB4OyB9Ci5udXR6ZW4tbG9nIHsgbWF4LWhlaWdodDoyNjBweDsgb3ZlcmZsb3c6YXV0bzsgcGFkZGluZzoxOHB4OyB9Ci5udXR6ZW4tYWRtaW4tZm9vdGVyIHN0cm9uZyB7IGNvbG9yOnZhcigtLW51dHplbi1wdXJwbGUpOyB9Ci5udXR6ZW4tYWRtaW4tY29sdW1ucyB7IGRpc3BsYXk6Z3JpZDsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOnJlcGVhdCgyLG1pbm1heCgwLDFmcikpOyBnYXA6MThweDsgbWFyZ2luOjE4cHggMCAyOHB4OyB9Ci5udXR6ZW4tZm9ybS1ncmlkLCAubnV0emVuLWFwcGxpY2F0aW9uLWdyaWQgeyBkaXNwbGF5OmdyaWQ7IGdyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoMixtaW5tYXgoMCwxZnIpKTsgZ2FwOjE2cHg7IH0KLm51dHplbi1mb3JtLWdyaWQgbGFiZWwsIC5udXR6ZW4tYXBwbGljYXRpb24tZ3JpZCBsYWJlbCB7IGRpc3BsYXk6Z3JpZDsgYWxpZ24tY29udGVudDpzdGFydDsgZ2FwOjdweDsgY29sb3I6IzMzNDE1NTsgZm9udC13ZWlnaHQ6NjAwOyB9Ci5udXR6ZW4tZm9ybS1ncmlkIGxhYmVsID4gc3BhbjpmaXJzdC1jaGlsZCwgLm51dHplbi1hcHBsaWNhdGlvbi1ncmlkIGxhYmVsID4gc3BhbjpmaXJzdC1jaGlsZCB7IGZvbnQtc2l6ZToxMnB4OyB9Ci5udXR6ZW4tZm9ybS1ncmlkIC5pcy13aWRlLCAubnV0emVuLWFwcGxpY2F0aW9uLWdyaWQgLmlzLXdpZGUgeyBncmlkLWNvbHVtbjoxLy0xOyB9Ci5udXR6ZW4tZm9ybS1ncmlkIGlucHV0Om5vdChbdHlwZT0iY2hlY2tib3giXSksIC5udXR6ZW4tZm9ybS1ncmlkIHNlbGVjdCwgLm51dHplbi1mb3JtLWdyaWQgdGV4dGFyZWEsIC5udXR6ZW4tYXBwbGljYXRpb24tZ3JpZCBpbnB1dCwgLm51dHplbi1hcHBsaWNhdGlvbi1ncmlkIHNlbGVjdCwgLm51dHplbi1hcHBsaWNhdGlvbi1ncmlkIHRleHRhcmVhIHsgd2lkdGg6MTAwJTsgbWluLWhlaWdodDo0MHB4OyBib3JkZXItY29sb3I6I2Q4YzhlMTsgYm9yZGVyLXJhZGl1czo1cHg7IH0KLm51dHplbi10YWJsZS13cmFwIHsgb3ZlcmZsb3c6YXV0bzsgbWFyZ2luOjEycHggMCAzMHB4OyBib3JkZXI6MXB4IHNvbGlkICNlNWQ4ZWI7IGJvcmRlci1yYWRpdXM6N3B4OyBiYWNrZ3JvdW5kOiNmZmY7IGJveC1zaGFkb3c6MCA4cHggMjRweCByZ2JhKDYyLDE4LDg1LC4wNSk7IH0KLm51dHplbi10YWJsZS13cmFwIHRhYmxlIHsgbWluLXdpZHRoOjg2MHB4OyBib3JkZXI6MDsgfQoubnV0emVuLXRhYmxlLXdyYXAgaW5wdXQsIC5udXR6ZW4tdGFibGUtd3JhcCBzZWxlY3QgeyBtYXgtd2lkdGg6MjEwcHg7IH0KLm51dHplbi1pbmxpbmUtZm9ybSB7IGRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBnYXA6N3B4OyB9Ci5udXR6ZW4taW5saW5lLWZvcm0gaW5wdXQsIC5udXR6ZW4taW5saW5lLWZvcm0gc2VsZWN0IHsgbWluLXdpZHRoOjA7IH0KLm51dHplbi1hZG1pbi1maWx0ZXIgeyBkaXNwbGF5OmZsZXg7IGZsZXgtd3JhcDp3cmFwOyBhbGlnbi1pdGVtczpjZW50ZXI7IGdhcDo5cHg7IG1hcmdpbjowIDAgMjJweDsgcGFkZGluZzoxNHB4OyBib3JkZXI6MXB4IHNvbGlkICNlNWQ4ZWI7IGJvcmRlci1yYWRpdXM6N3B4OyBiYWNrZ3JvdW5kOiNmZmY7IH0KLm51dHplbi1hZG1pbi1maWx0ZXIgaW5wdXRbdHlwZT0ic2VhcmNoIl0geyB3aWR0aDptaW4oMzYwcHgsMTAwJSk7IH0KLm51dHplbi1zdWJzY3JpcHRpb24tbGlzdCB7IGRpc3BsYXk6Z3JpZDsgZ2FwOjE1cHg7IH0KLm51dHplbi1yZWNvcmQtY2FyZCB7IHBhZGRpbmc6MjJweDsgYm9yZGVyOjFweCBzb2xpZCAjZTVkOGViOyBib3JkZXItcmFkaXVzOjdweDsgYmFja2dyb3VuZDojZmZmOyBib3gtc2hhZG93OjAgOHB4IDI0cHggcmdiYSg2MiwxOCw4NSwuMDUpOyB9Ci5udXR6ZW4tcmVjb3JkLWNhcmRfX2hlYWQsIC5udXR6ZW4tcmVjb3JkLWNhcmRfX2FjdGlvbnMgeyBkaXNwbGF5OmZsZXg7IGFsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7IGp1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuOyBnYXA6MThweDsgfQoubnV0emVuLXJlY29yZC1jYXJkX19oZWFkIHsgbWFyZ2luLWJvdHRvbToyMHB4OyB9Ci5udXR6ZW4tcmVjb3JkLWNhcmRfX2hlYWQgaDMgeyBtYXJnaW46NXB4IDA7IGNvbG9yOnZhcigtLW51dHplbi10ZWFsKTsgZm9udC1zaXplOjIxcHg7IH0KLm51dHplbi1yZWNvcmQtY2FyZF9faGVhZCBwIHsgbWFyZ2luOjA7IGNvbG9yOiM2NDc0OGI7IH0KLm51dHplbi1yZWNvcmQtY2FyZF9fYWN0aW9ucyB7IGFsaWduLWl0ZW1zOmNlbnRlcjsgbWFyZ2luLXRvcDoyMHB4OyB9Ci5udXR6ZW4tYXBwbGljYXRpb24tZWRpdG9yIHsgcGFkZGluZzo2cHggMnB4OyB9Ci5udXR6ZW4tc3RhdHVzIHsgZGlzcGxheTppbmxpbmUtZmxleDsgcGFkZGluZzo0cHggOXB4OyBib3JkZXItcmFkaXVzOjk5cHg7IGJhY2tncm91bmQ6I2VlZTsgZm9udC1zaXplOjExcHg7IGZvbnQtd2VpZ2h0OjcwMDsgfQoubnV0emVuLXN0YXR1cy0tYXBwcm92ZWQgeyBiYWNrZ3JvdW5kOiNlYWY2ZGY7IGNvbG9yOiM0ZjdiMmU7IH0KLm51dHplbi1zdGF0dXMtLXBlbmRpbmcsIC5udXR6ZW4tc3RhdHVzLS1pbl9yZXZpZXcgeyBiYWNrZ3JvdW5kOiNmZmYwZGQ7IGNvbG9yOiNhODVmMTY7IH0KLm51dHplbi1zdGF0dXMtLXJlamVjdGVkIHsgYmFja2dyb3VuZDojZmJlNGU0OyBjb2xvcjojYTMzNDM0OyB9Ci5udXR6ZW4tc3RhdHVzLS1zdXNwZW5kZWQgeyBiYWNrZ3JvdW5kOiNmMWU4ZjY7IGNvbG9yOiM1YjI2NzQ7IH0KLm51dHplbi1zdGF0dXMtLXJlbW92ZWQgeyBiYWNrZ3JvdW5kOiNlOWVkZjA7IGNvbG9yOiM1MjYwNmI7IH0KLm51dHplbi1zdGF0dXMtLWFjdGl2ZSB7IGJhY2tncm91bmQ6I2VhZjZkZjsgY29sb3I6IzRmN2IyZTsgfQoubnV0emVuLXN0YXR1cy0tcGVuZGluZ19nYXRld2F5IHsgYmFja2dyb3VuZDojZmZmMGRkOyBjb2xvcjojYTg1ZjE2OyB9Ci5udXR6ZW4tc3RhdHVzLS1wYXVzZWQgeyBiYWNrZ3JvdW5kOiNmMWU4ZjY7IGNvbG9yOiM1YjI2NzQ7IH0KLm51dHplbi1zdGF0dXMtLWNhbmNlbGxlZCB7IGJhY2tncm91bmQ6I2U5ZWRmMDsgY29sb3I6IzUyNjA2YjsgfQoubnV0emVuLXF1aWNrLWFjdGlvbnMtLXBhZ2UgeyBtYXJnaW46LTEycHggMCAyOHB4OyB9Ci5udXR6ZW4tYmFubmVyLWVkaXRvciB7IHBhZGRpbmc6OHB4IDJweDsgfQoubnV0emVuLWJhbm5lci1ncmlkIHsgZGlzcGxheTpncmlkOyBncmlkLXRlbXBsYXRlLWNvbHVtbnM6cmVwZWF0KDIsbWlubWF4KDAsMWZyKSk7IGdhcDoxOHB4OyBtYXJnaW46MThweCAwOyB9Ci5udXR6ZW4tYmFubmVyLW1lZGlhIHsgZGlzcGxheTpncmlkOyBnYXA6MTBweDsgcGFkZGluZzoxNnB4OyBib3JkZXI6MXB4IHNvbGlkICNlNWQ4ZWI7IGJvcmRlci1yYWRpdXM6N3B4OyBiYWNrZ3JvdW5kOiNmYWY3ZmM7IH0KLm51dHplbi1iYW5uZXItcHJldmlldyB7IGRpc3BsYXk6Z3JpZDsgbWluLWhlaWdodDoyMTBweDsgcGxhY2UtaXRlbXM6Y2VudGVyOyBvdmVyZmxvdzpoaWRkZW47IGJvcmRlcjoxcHggZGFzaGVkICNjYmI2ZDU7IGJvcmRlci1yYWRpdXM6NnB4OyBiYWNrZ3JvdW5kOiNmZmY7IGNvbG9yOiM3NzZhN2U7IH0KLm51dHplbi1iYW5uZXItcHJldmlldyBpbWcgeyBkaXNwbGF5OmJsb2NrOyB3aWR0aDoxMDAlOyBoZWlnaHQ6MjEwcHg7IG9iamVjdC1maXQ6Y29udGFpbjsgfQoubnV0emVuLWJhbm5lci1tZWRpYV9fYWN0aW9ucyB7IGRpc3BsYXk6ZmxleDsgZmxleC13cmFwOndyYXA7IGdhcDo4cHg7IH0KLm51dHplbi1iYW5uZXItb3B0aW9ucyB7IG1hcmdpbi10b3A6MjBweDsgfQoubnV0emVuLWJhbm5lci1vcHRpb25zIHNtYWxsIHsgY29sb3I6IzY0NzQ4YjsgZm9udC13ZWlnaHQ6NDAwOyB9Ci5udXR6ZW4tYmFubmVyLWxpc3QtcHJldmlldyB7IGRpc3BsYXk6YmxvY2s7IHdpZHRoOjEyMHB4OyBoZWlnaHQ6NTRweDsgb2JqZWN0LWZpdDpjb3ZlcjsgYm9yZGVyLXJhZGl1czo0cHg7IH0KLmNvbHVtbi1iYW5uZXJfcHJldmlldyB7IHdpZHRoOjEzMHB4OyB9Ci5jb2x1bW4tYmFubmVyX29yZGVyIHsgd2lkdGg6NzBweDsgfQoKI2Rhc2hib2FyZC13aWRnZXRzICNudXR6ZW5fb3ZlcnZpZXcgLmluc2lkZSB7IG1hcmdpbjowOyBwYWRkaW5nOjEycHggMTRweCAxNnB4OyB9CiNkYXNoYm9hcmQtd2lkZ2V0cyAjbnV0emVuX292ZXJ2aWV3IC5udXR6ZW4tc3RhdC1ncmlkIHsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOnJlcGVhdChhdXRvLWZpdCxtaW5tYXgoODVweCwxZnIpKTsgfQoKYm9keS5sb2dpbiB7IGJhY2tncm91bmQ6dmFyKC0tbnV0emVuLWxpbGFjKTsgfQpib2R5LmxvZ2luICNsb2dpbiBoMSBhIHsgd2lkdGg6YXV0bzsgaGVpZ2h0OmF1dG87IGJhY2tncm91bmQ6bm9uZTsgdGV4dC1pbmRlbnQ6MDsgY29sb3I6dmFyKC0tbnV0emVuLW9yYW5nZSk7IGZvbnQtc2l6ZTozNHB4OyBmb250LXdlaWdodDo5MDA7IGxpbmUtaGVpZ2h0OjEuMjsgfQpib2R5LmxvZ2luICNsb2dpbmZvcm0geyBib3JkZXI6MDsgYm9yZGVyLXJhZGl1czo4cHg7IGJveC1zaGFkb3c6MCAxOHB4IDU1cHggcmdiYSg2MiwxOCw4NSwuMTQpOyB9CmJvZHkubG9naW4gLmJ1dHRvbi1wcmltYXJ5IHsgbWluLWhlaWdodDozOHB4OyB9CgpAbWVkaWEgKG1heC13aWR0aDogOTYwcHgpIHsKICAubnV0emVuLXN0YXQtZ3JpZCwgI2Rhc2hib2FyZC13aWRnZXRzICNudXR6ZW5fb3ZlcnZpZXcgLm51dHplbi1zdGF0LWdyaWQgeyBncmlkLXRlbXBsYXRlLWNvbHVtbnM6cmVwZWF0KDIsbWlubWF4KDAsMWZyKSk7IH0KICAubnV0emVuLWFkbWluLWhlcm8geyBhbGlnbi1pdGVtczpmbGV4LXN0YXJ0OyBmbGV4LWRpcmVjdGlvbjpjb2x1bW47IH0KICAubnV0emVuLWFkbWluLWNvbHVtbnMsIC5udXR6ZW4tZm9ybS1ncmlkLCAubnV0emVuLWFwcGxpY2F0aW9uLWdyaWQsIC5udXR6ZW4tYmFubmVyLWdyaWQgeyBncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyOyB9CiAgLm51dHplbi1mb3JtLWdyaWQgLmlzLXdpZGUsIC5udXR6ZW4tYXBwbGljYXRpb24tZ3JpZCAuaXMtd2lkZSB7IGdyaWQtY29sdW1uOmF1dG87IH0KfQo=';

	/** @var string[] */
	private const MODULES = array( 'fields', 'affiliates', 'subscriptions', 'banners' );

	public static function bootstrap(): void {
		register_activation_hook( __FILE__, array( __CLASS__, 'activate' ) );
		add_action( 'before_woocommerce_init', array( __CLASS__, 'declare_compatibility' ) );
		add_action( 'plugins_loaded', array( __CLASS__, 'maybe_upgrade' ), 20 );
		add_action( 'init', array( __CLASS__, 'register_application_type' ) );
		add_action( 'add_meta_boxes_nutzen_banner', array( __CLASS__, 'banner_meta_box' ) );
		add_action( 'save_post_nutzen_banner', array( __CLASS__, 'save_banner' ), 10, 2 );
		add_action( 'transition_post_status', array( __CLASS__, 'banner_status_changed' ), 10, 3 );
		add_filter( 'manage_nutzen_banner_posts_columns', array( __CLASS__, 'banner_columns' ) );
		add_action( 'manage_nutzen_banner_posts_custom_column', array( __CLASS__, 'banner_column' ), 10, 2 );
		add_action( 'add_meta_boxes_nutzen_application', array( __CLASS__, 'application_meta_box' ) );
		add_action( 'save_post_nutzen_application', array( __CLASS__, 'save_application' ), 10, 2 );
		add_filter( 'manage_nutzen_application_posts_columns', array( __CLASS__, 'application_columns' ) );
		add_action( 'manage_nutzen_application_posts_custom_column', array( __CLASS__, 'application_column' ), 10, 2 );
		add_filter( 'nutzen_module_enabled', array( __CLASS__, 'module_enabled' ), 10, 2 );
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'admin_assets' ) );
		add_action( 'wp_dashboard_setup', array( __CLASS__, 'dashboard_widgets' ) );
		add_action( 'login_enqueue_scripts', array( __CLASS__, 'login_assets' ) );
		add_filter( 'admin_footer_text', array( __CLASS__, 'admin_footer' ) );
		add_filter( 'login_headertext', static fn(): string => 'NutzenPet' );
		add_filter( 'login_headerurl', static fn(): string => home_url( '/' ) );
		add_action( 'save_post_product', array( __CLASS__, 'product_changed' ), 30, 3 );
		add_action( 'save_post_nutzen_plan', array( __CLASS__, 'subscription_plan_changed' ), 30, 3 );
		add_action( 'edited_product_cat', array( __CLASS__, 'category_changed' ) );
		add_action( 'created_product_cat', array( __CLASS__, 'category_changed' ) );
		add_filter( 'determine_current_user', array( __CLASS__, 'authenticate_bearer_user' ), 30 );
		add_action( 'woocommerce_checkout_validate_order_before_payment', array( __CLASS__, 'require_customer_account' ), 10, 2 );
		add_filter( 'woocommerce_package_rates', array( __CLASS__, 'subsidize_shipping_rates' ), 1000, 2 );
		add_action( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
	}

	public static function activate(): void {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$table   = $wpdb->prefix . 'nutzen_sessions';
		$charset = $wpdb->get_charset_collate();
		dbDelta( "CREATE TABLE {$table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			token_hash char(64) NOT NULL,
			expires_at datetime NOT NULL,
			created_at datetime NOT NULL,
			last_used_at datetime NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY token_hash (token_hash),
			KEY user_expiry (user_id,expires_at)
		) {$charset};" );
	}

	public static function maybe_upgrade(): void {
		if ( self::VERSION === (string) get_option( 'nutzen_switch_version', '' ) ) {
			return;
		}
		update_option( 'nutzen_switch_version', self::VERSION, false );
		if ( class_exists( 'WC_Cache_Helper' ) ) {
			WC_Cache_Helper::get_transient_version( 'shipping', true );
		}
	}

	public static function declare_compatibility(): void {
		if ( class_exists( FeaturesUtil::class ) ) {
			FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
		}
	}

	public static function register_application_type(): void {
		register_post_type(
			'nutzen_application',
			array(
				'labels' => array(
					'name'          => 'Candidaturas',
					'singular_name' => 'Candidatura',
					'add_new_item'  => 'Adicionar candidatura',
					'edit_item'     => 'Analisar candidatura',
				),
				'public'       => false,
				'show_ui'      => true,
				'show_in_menu' => 'nutzen-switch',
				'supports'     => array( 'title' ),
				'capability_type' => 'product',
				'map_meta_cap' => true,
				'menu_icon'    => 'dashicons-forms',
			)
		);

		register_post_type(
			'nutzen_banner',
			array(
				'labels' => array(
					'name'          => 'Banners rotativos',
					'singular_name' => 'Banner rotativo',
					'add_new_item'  => 'Adicionar banner',
					'edit_item'     => 'Editar banner',
					'new_item'      => 'Novo banner',
					'view_item'     => 'Visualizar banner',
					'search_items'  => 'Buscar banners',
				),
				'public'          => false,
				'show_ui'         => true,
				'show_in_menu'    => 'nutzen-switch',
				'show_in_rest'    => false,
				'supports'        => array( 'title' ),
				'capability_type' => 'product',
				'map_meta_cap'    => true,
				'menu_icon'       => 'dashicons-images-alt2',
			)
		);
	}

	public static function banner_meta_box(): void {
		add_meta_box( 'nutzen-banner-data', 'Arte e destino do banner', array( __CLASS__, 'render_banner_meta_box' ), 'nutzen_banner', 'normal', 'high' );
	}

	public static function render_banner_meta_box( WP_Post $post ): void {
		wp_nonce_field( 'nutzen_banner_save', 'nutzen_banner_nonce' );
		$desktop_id = absint( get_post_meta( $post->ID, '_nutzen_banner_desktop_id', true ) );
		$mobile_id  = absint( get_post_meta( $post->ID, '_nutzen_banner_mobile_id', true ) );
		$link       = (string) get_post_meta( $post->ID, '_nutzen_banner_link', true );
		$order      = (int) get_post_meta( $post->ID, '_nutzen_banner_order', true );
		?>
		<div class="nutzen-banner-editor">
			<p class="description">Envie a arte completa do banner. Recomendado: desktop 1920 x 840 px e mobile 1080 x 1350 px.</p>
			<div class="nutzen-banner-grid">
				<?php self::render_banner_image_field( 'desktop', 'Imagem desktop', $desktop_id ); ?>
				<?php self::render_banner_image_field( 'mobile', 'Imagem mobile', $mobile_id ); ?>
			</div>
			<div class="nutzen-form-grid nutzen-banner-options">
				<label class="is-wide"><span>Link do banner</span><input type="url" name="nutzen_banner[link]" value="<?php echo esc_attr( $link ); ?>" placeholder="https://... ou /produto"><small>Opcional. A arte inteira ficará clicável.</small></label>
				<label><span>Ordem</span><input type="number" min="0" step="1" name="nutzen_banner[order]" value="<?php echo esc_attr( (string) $order ); ?>"><small>Menores números aparecem primeiro entre os banners publicados.</small></label>
			</div>
			<p class="description"><strong>Publicação:</strong> use o painel lateral do WordPress para salvar como rascunho, publicar imediatamente ou agendar.</p>
		</div>
		<?php
	}

	private static function render_banner_image_field( string $key, string $label, int $attachment_id ): void {
		$image = $attachment_id ? wp_get_attachment_image_url( $attachment_id, 'large' ) : '';
		?>
		<div class="nutzen-banner-media" data-banner-media>
			<strong><?php echo esc_html( $label ); ?></strong>
			<div class="nutzen-banner-preview <?php echo $image ? 'has-image' : ''; ?>" data-banner-preview>
				<?php if ( $image ) : ?><img src="<?php echo esc_url( $image ); ?>" alt=""><?php else : ?><span>Nenhuma imagem selecionada</span><?php endif; ?>
			</div>
			<input type="hidden" name="nutzen_banner[<?php echo esc_attr( $key ); ?>_id]" value="<?php echo esc_attr( (string) $attachment_id ); ?>" data-banner-image-id>
			<div class="nutzen-banner-media__actions">
				<button type="button" class="button button-primary" data-banner-select>Selecionar imagem</button>
				<button type="button" class="button" data-banner-remove <?php echo $attachment_id ? '' : 'hidden'; ?>>Remover</button>
			</div>
		</div>
		<?php
	}

	public static function save_banner( int $post_id, WP_Post $post ): void {
		$nonce = isset( $_POST['nutzen_banner_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nutzen_banner_nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'nutzen_banner_save' ) || wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_product', $post_id ) ) {
			return;
		}
		$data = isset( $_POST['nutzen_banner'] ) && is_array( $_POST['nutzen_banner'] ) ? wp_unslash( $_POST['nutzen_banner'] ) : array();
		update_post_meta( $post_id, '_nutzen_banner_desktop_id', absint( $data['desktop_id'] ?? 0 ) );
		update_post_meta( $post_id, '_nutzen_banner_mobile_id', absint( $data['mobile_id'] ?? 0 ) );
		update_post_meta( $post_id, '_nutzen_banner_link', esc_url_raw( (string) ( $data['link'] ?? '' ) ) );
		update_post_meta( $post_id, '_nutzen_banner_order', max( 0, absint( $data['order'] ?? 0 ) ) );
		self::send_webhook( array( 'nutzen-banners' ) );
	}

	/** @param array<string, string> $columns @return array<string, string> */
	public static function banner_columns( array $columns ): array {
		return array( 'cb' => $columns['cb'], 'banner_preview' => 'Arte', 'title' => 'Banner', 'banner_devices' => 'Versões', 'banner_link' => 'Link', 'banner_order' => 'Ordem', 'date' => 'Publicação' );
	}

	public static function banner_column( string $column, int $post_id ): void {
		$desktop_id = absint( get_post_meta( $post_id, '_nutzen_banner_desktop_id', true ) );
		$mobile_id  = absint( get_post_meta( $post_id, '_nutzen_banner_mobile_id', true ) );
		if ( 'banner_preview' === $column ) echo $desktop_id ? wp_get_attachment_image( $desktop_id, array( 120, 54 ), false, array( 'class' => 'nutzen-banner-list-preview' ) ) : '<span aria-hidden="true">—</span>';
		if ( 'banner_devices' === $column ) echo esc_html( $desktop_id ? ( $mobile_id ? 'Desktop + mobile' : 'Desktop' ) : 'Incompleto' );
		if ( 'banner_link' === $column ) { $link = (string) get_post_meta( $post_id, '_nutzen_banner_link', true ); echo $link ? '<a href="' . esc_url( $link ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( wp_html_excerpt( $link, 42, '…' ) ) . '</a>' : '<span aria-hidden="true">—</span>'; }
		if ( 'banner_order' === $column ) echo esc_html( (string) (int) get_post_meta( $post_id, '_nutzen_banner_order', true ) );
	}

	/** @return array<string, string> */
	private static function application_fields(): array {
		return array(
			'_nutzen_application_type'       => 'Tipo',
			'_nutzen_application_status'     => 'Status',
			'_nutzen_application_user_id'    => 'ID do usuário',
			'_nutzen_application_name'       => 'Nome completo',
			'_nutzen_application_email'      => 'E-mail',
			'_nutzen_application_phone'      => 'Telefone / WhatsApp',
			'_nutzen_application_company'    => 'Empresa / loja',
			'_nutzen_application_cnpj'       => 'CNPJ',
			'_nutzen_application_city'       => 'Cidade',
			'_nutzen_application_state'      => 'Estado',
			'_nutzen_application_website'    => 'Site',
			'_nutzen_application_social'     => 'Rede social',
			'_nutzen_application_audience'   => 'Público / audiência',
			'_nutzen_application_experience' => 'Experiência',
			'_nutzen_application_message'    => 'Apresentação',
		);
	}

	public static function application_meta_box(): void {
		add_meta_box( 'nutzen-application-data', 'Dados da candidatura', array( __CLASS__, 'render_application_meta_box' ), 'nutzen_application', 'normal', 'high' );
	}

	public static function render_application_meta_box( WP_Post $post ): void {
		wp_nonce_field( 'nutzen_application_save', 'nutzen_application_nonce' );
		$type   = (string) get_post_meta( $post->ID, '_nutzen_application_type', true ) ?: 'retailer';
		$status = (string) get_post_meta( $post->ID, '_nutzen_application_status', true ) ?: 'pending';
		?>
		<div class="nutzen-application-editor">
			<div class="nutzen-application-grid">
				<label><span>Tipo</span><select name="nutzen_application[type]"><option value="retailer" <?php selected( $type, 'retailer' ); ?>>Lojista parceiro</option><option value="affiliate" <?php selected( $type, 'affiliate' ); ?>>Afiliado</option><option value="subscription" <?php selected( $type, 'subscription' ); ?>>Interesse em assinatura</option></select></label>
				<label><span>Status</span><select name="nutzen_application[status]"><option value="pending" <?php selected( $status, 'pending' ); ?>>Pendente</option><option value="in_review" <?php selected( $status, 'in_review' ); ?>>Em análise</option><option value="approved" <?php selected( $status, 'approved' ); ?>>Aprovada</option><option value="rejected" <?php selected( $status, 'rejected' ); ?>>Rejeitada</option></select></label>
				<?php foreach ( self::application_fields() as $key => $label ) : if ( in_array( $key, array( '_nutzen_application_type', '_nutzen_application_status' ), true ) ) continue; $name = substr( $key, strlen( '_nutzen_application_' ) ); $value = (string) get_post_meta( $post->ID, $key, true ); ?>
					<label class="<?php echo in_array( $name, array( 'experience', 'message' ), true ) ? 'is-wide' : ''; ?>"><span><?php echo esc_html( $label ); ?></span><?php if ( in_array( $name, array( 'experience', 'message' ), true ) ) : ?><textarea name="nutzen_application[<?php echo esc_attr( $name ); ?>]" rows="4"><?php echo esc_textarea( $value ); ?></textarea><?php else : ?><input type="<?php echo 'user_id' === $name ? 'number' : 'text'; ?>" name="nutzen_application[<?php echo esc_attr( $name ); ?>]" value="<?php echo esc_attr( $value ); ?>"><?php endif; ?></label>
				<?php endforeach; ?>
			</div>
			<p class="description">A aprovação de uma candidatura de afiliado ativa o programa para o usuário vinculado. Nenhuma assinatura ou pagamento é criado automaticamente.</p>
		</div>
		<?php
	}

	public static function save_application( int $post_id, WP_Post $post ): void {
		$nonce = isset( $_POST['nutzen_application_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nutzen_application_nonce'] ) ) : '';
		if ( ! wp_verify_nonce( $nonce, 'nutzen_application_save' ) || wp_is_post_autosave( $post_id ) || ! current_user_can( 'edit_product', $post_id ) ) return;
		$data = isset( $_POST['nutzen_application'] ) && is_array( $_POST['nutzen_application'] ) ? wp_unslash( $_POST['nutzen_application'] ) : array();
		$previous = (string) get_post_meta( $post_id, '_nutzen_application_status', true ) ?: 'pending';
		self::save_application_meta( $post_id, $data );
		$current = (string) get_post_meta( $post_id, '_nutzen_application_status', true );
		if ( $previous !== $current ) do_action( 'nutzen_application_status_changed', $post_id, $current, $previous );
	}

	/** @param array<string, mixed> $data */
	private static function save_application_meta( int $post_id, array $data ): void {
		$type = sanitize_key( (string) ( $data['type'] ?? 'retailer' ) );
		$status = sanitize_key( (string) ( $data['status'] ?? 'pending' ) );
		update_post_meta( $post_id, '_nutzen_application_type', in_array( $type, array( 'retailer', 'affiliate', 'subscription' ), true ) ? $type : 'retailer' );
		update_post_meta( $post_id, '_nutzen_application_status', in_array( $status, array( 'pending', 'in_review', 'approved', 'rejected' ), true ) ? $status : 'pending' );
		foreach ( array( 'name', 'phone', 'company', 'cnpj', 'city', 'state', 'audience', 'experience', 'message' ) as $field ) update_post_meta( $post_id, '_nutzen_application_' . $field, sanitize_textarea_field( (string) ( $data[ $field ] ?? '' ) ) );
		update_post_meta( $post_id, '_nutzen_application_email', sanitize_email( (string) ( $data['email'] ?? '' ) ) );
		update_post_meta( $post_id, '_nutzen_application_website', esc_url_raw( (string) ( $data['website'] ?? '' ) ) );
		update_post_meta( $post_id, '_nutzen_application_social', esc_url_raw( (string) ( $data['social'] ?? '' ) ) );
		update_post_meta( $post_id, '_nutzen_application_user_id', absint( $data['user_id'] ?? 0 ) );
	}

	/** @param array<string, string> $columns @return array<string, string> */
	public static function application_columns( array $columns ): array {
		return array( 'cb' => $columns['cb'], 'title' => 'Candidato', 'application_type' => 'Tipo', 'application_contact' => 'Contato', 'application_status' => 'Status', 'date' => 'Recebida em' );
	}

	public static function application_column( string $column, int $post_id ): void {
		if ( 'application_type' === $column ) echo esc_html( array( 'retailer' => 'Lojista parceiro', 'affiliate' => 'Afiliado', 'subscription' => 'Assinatura' )[ get_post_meta( $post_id, '_nutzen_application_type', true ) ] ?? '—' );
		if ( 'application_contact' === $column ) echo esc_html( get_post_meta( $post_id, '_nutzen_application_email', true ) . ' · ' . get_post_meta( $post_id, '_nutzen_application_phone', true ) );
		if ( 'application_status' === $column ) echo '<span class="nutzen-status nutzen-status--' . esc_attr( (string) get_post_meta( $post_id, '_nutzen_application_status', true ) ) . '">' . esc_html( ucfirst( (string) get_post_meta( $post_id, '_nutzen_application_status', true ) ?: 'pending' ) ) . '</span>';
	}

	/** @param mixed $enabled */
	public static function module_enabled( $enabled, string $module ): bool {
		if ( ! in_array( $module, self::MODULES, true ) ) {
			return (bool) $enabled;
		}
		$settings = self::settings();
		return ! isset( $settings[ 'module_' . $module ] ) || '0' !== $settings[ 'module_' . $module ];
	}

	/** @return array<string, string> */
	private static function settings(): array {
		$defaults = array(
			'module_fields'        => '1',
			'module_affiliates'    => '1',
			'module_subscriptions' => '1',
			'module_banners'       => '1',
			'shipping_subsidy'     => '15.90',
			'frontend_url'         => 'http://localhost:3000',
			'wordpress_url'        => home_url(),
			'webhook_secret'       => '',
		);
		return wp_parse_args( (array) get_option( self::OPTION, array() ), $defaults );
	}

	public static function register_settings(): void {
		register_setting(
			'nutzen_switch',
			self::OPTION,
			array( 'type' => 'array', 'sanitize_callback' => array( __CLASS__, 'sanitize_settings' ), 'default' => self::settings() )
		);
	}

	/** @param mixed $input @return array<string, string> */
	public static function sanitize_settings( $input ): array {
		$current = self::settings();
		$input   = is_array( $input ) ? $input : array();
		$shipping_subsidy = function_exists( 'wc_format_decimal' )
			? wc_format_decimal( (string) ( $input['shipping_subsidy'] ?? $current['shipping_subsidy'] ), 2 )
			: number_format( max( 0, (float) str_replace( ',', '.', (string) ( $input['shipping_subsidy'] ?? $current['shipping_subsidy'] ) ) ), 2, '.', '' );
		$output  = array(
			'module_fields'        => isset( $input['module_fields'] ) ? '1' : '0',
			'module_affiliates'    => isset( $input['module_affiliates'] ) ? '1' : '0',
			'module_subscriptions' => isset( $input['module_subscriptions'] ) ? '1' : '0',
			'module_banners'       => isset( $input['module_banners'] ) ? '1' : '0',
			'shipping_subsidy'     => number_format( max( 0, (float) $shipping_subsidy ), 2, '.', '' ),
			'frontend_url'         => esc_url_raw( (string) ( $input['frontend_url'] ?? '' ) ),
			'wordpress_url'        => esc_url_raw( (string) ( $input['wordpress_url'] ?? home_url() ) ),
			'webhook_secret'       => $current['webhook_secret'],
		);
		if ( ! empty( $input['webhook_secret'] ) ) {
			$output['webhook_secret'] = sanitize_text_field( $input['webhook_secret'] );
		}
		if ( $current['shipping_subsidy'] !== $output['shipping_subsidy'] && class_exists( 'WC_Cache_Helper' ) ) {
			WC_Cache_Helper::get_transient_version( 'shipping', true );
		}
		return $output;
	}

	public static function admin_menu(): void {
		add_menu_page( 'Nutzen Switch', 'Nutzen Switch', 'manage_woocommerce', 'nutzen-switch', array( __CLASS__, 'render_page' ), 'dashicons-pets', 56 );
		add_submenu_page( 'nutzen-switch', 'Configurações Nutzen', 'Configurações', 'manage_woocommerce', 'nutzen-switch', array( __CLASS__, 'render_page' ), 0 );
	}

	public static function admin_assets(): void {
		self::enqueue_admin_style( 'nutzen-admin' );
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( $screen && 'nutzen_banner' === $screen->post_type ) {
			wp_enqueue_media();
			wp_enqueue_script( 'nutzen-banner-admin', plugins_url( 'assets/admin-banners.js', __FILE__ ), array(), self::VERSION, true );
		}
	}

	public static function login_assets(): void {
		self::enqueue_admin_style( 'nutzen-admin-login' );
	}

	private static function enqueue_admin_style( string $handle ): void {
		$path    = plugin_dir_path( __FILE__ ) . 'assets/admin.css';
		$version = is_file( $path ) ? (string) filemtime( $path ) : self::VERSION;
		wp_enqueue_style( $handle, plugins_url( 'assets/admin.css', __FILE__ ), array(), $version );
		$css = base64_decode( self::ADMIN_CSS_BASE64, true );
		if ( is_string( $css ) && '' !== $css ) {
			wp_add_inline_style( $handle, $css );
		}
	}

	public static function admin_footer(): string {
		return '<span class="nutzen-admin-footer"><strong>NutzenPet</strong> · gestão integrada com WooCommerce</span>';
	}

	public static function dashboard_widgets(): void {
		if ( current_user_can( 'manage_woocommerce' ) ) {
			wp_add_dashboard_widget( 'nutzen_overview', 'Visão geral NutzenPet', array( __CLASS__, 'render_dashboard_widget' ) );
		}
	}

	/** @return array<string, int> */
	private static function dashboard_stats(): array {
		global $wpdb;
		$product_counts = wp_count_posts( 'product' );
		$user_counts    = count_users();
		$order_query    = function_exists( 'wc_get_orders' ) ? wc_get_orders( array( 'limit' => 1, 'paginate' => true, 'return' => 'ids' ) ) : null;
		$affiliate_table = $wpdb->prefix . 'nutzen_affiliates';
		$subscription_table = $wpdb->prefix . 'nutzen_subscriptions';
		$affiliates = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $affiliate_table ) ) === $affiliate_table ? (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$affiliate_table} WHERE status='approved'" ) : 0;
		$subscriptions = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $subscription_table ) ) === $subscription_table ? (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$subscription_table} WHERE status IN ('active','paused','pending_gateway')" ) : 0;
		$applications = (int) ( wp_count_posts( 'nutzen_application' )->private ?? 0 );
		$banner_counts = wp_count_posts( 'nutzen_banner' );
		return array(
			'products'      => (int) ( $product_counts->publish ?? 0 ),
			'orders'        => is_object( $order_query ) && isset( $order_query->total ) ? (int) $order_query->total : 0,
			'customers'     => (int) ( $user_counts['avail_roles']['customer'] ?? 0 ),
			'affiliates'    => $affiliates,
			'subscriptions' => $subscriptions,
			'applications'  => $applications,
			'banners'       => (int) ( $banner_counts->publish ?? 0 ),
		);
	}

	public static function render_dashboard_widget(): void {
		$stats = self::dashboard_stats();
		?>
		<div class="nutzen-dashboard-widget">
			<p class="nutzen-kicker">OPERAÇÃO DA LOJA</p>
			<div class="nutzen-stat-grid">
				<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=product' ) ); ?>"><strong><?php echo (int) $stats['products']; ?></strong><span>Produtos</span></a>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=wc-orders' ) ); ?>"><strong><?php echo (int) $stats['orders']; ?></strong><span>Pedidos</span></a>
				<a href="<?php echo esc_url( admin_url( 'users.php?role=customer' ) ); ?>"><strong><?php echo (int) $stats['customers']; ?></strong><span>Clientes</span></a>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=nutzen-affiliates' ) ); ?>"><strong><?php echo (int) $stats['affiliates']; ?></strong><span>Afiliados</span></a>
				<a href="<?php echo esc_url( admin_url( 'admin.php?page=nutzen-subscriptions' ) ); ?>"><strong><?php echo (int) $stats['subscriptions']; ?></strong><span>Assinaturas</span></a>
				<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=nutzen_application' ) ); ?>"><strong><?php echo (int) $stats['applications']; ?></strong><span>Candidaturas</span></a>
				<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=nutzen_banner' ) ); ?>"><strong><?php echo (int) $stats['banners']; ?></strong><span>Banners</span></a>
			</div>
			<div class="nutzen-quick-actions"><a class="button button-primary" href="<?php echo esc_url( admin_url( 'post-new.php?post_type=product' ) ); ?>">Adicionar produto</a><a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=nutzen-switch' ) ); ?>">Abrir central Nutzen</a></div>
		</div>
		<?php
	}

	public static function render_page(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}
		$settings = self::settings();
		$plugins  = array(
			'Campos personalizados' => 'nutzen-fields/nutzen-fields.php',
			'Afiliados'              => 'nutzen-affiliates/nutzen-affiliates.php',
			'Assinaturas'            => 'nutzen-subscriptions/nutzen-subscriptions.php',
		);
		?>
		<div class="wrap nutzen-admin">
			<section class="nutzen-admin-hero"><div><span class="nutzen-kicker">CENTRAL HEADLESS</span><h1>Nutzen Switch</h1><p>Produtos, clientes e integrações reunidos em uma visão clara da operação.</p></div><a class="button button-primary" href="<?php echo esc_url( $settings['frontend_url'] ); ?>" target="_blank" rel="noopener noreferrer">Abrir loja</a></section>
			<?php $stats = self::dashboard_stats(); ?>
			<div class="nutzen-stat-grid nutzen-stat-grid--page"><a href="<?php echo esc_url( admin_url( 'edit.php?post_type=product' ) ); ?>"><strong><?php echo (int) $stats['products']; ?></strong><span>Produtos publicados</span></a><a href="<?php echo esc_url( admin_url( 'admin.php?page=wc-orders' ) ); ?>"><strong><?php echo (int) $stats['orders']; ?></strong><span>Pedidos</span></a><a href="<?php echo esc_url( admin_url( 'users.php?role=customer' ) ); ?>"><strong><?php echo (int) $stats['customers']; ?></strong><span>Clientes</span></a><a href="<?php echo esc_url( admin_url( 'admin.php?page=nutzen-affiliates' ) ); ?>"><strong><?php echo (int) $stats['affiliates']; ?></strong><span>Afiliados ativos</span></a><a href="<?php echo esc_url( admin_url( 'admin.php?page=nutzen-subscriptions' ) ); ?>"><strong><?php echo (int) $stats['subscriptions']; ?></strong><span>Assinaturas</span></a><a href="<?php echo esc_url( admin_url( 'edit.php?post_type=nutzen_application' ) ); ?>"><strong><?php echo (int) $stats['applications']; ?></strong><span>Candidaturas</span></a><a href="<?php echo esc_url( admin_url( 'edit.php?post_type=nutzen_banner' ) ); ?>"><strong><?php echo (int) $stats['banners']; ?></strong><span>Banners publicados</span></a></div>
			<div class="nutzen-quick-actions nutzen-quick-actions--page"><a class="button button-primary" href="<?php echo esc_url( admin_url( 'post-new.php?post_type=nutzen_banner' ) ); ?>">Adicionar banner</a><a class="button" href="<?php echo esc_url( admin_url( 'edit.php?post_type=nutzen_banner' ) ); ?>">Gerenciar banners rotativos</a></div>
			<h2>Saúde dos módulos</h2>
			<table class="widefat striped nutzen-status-table">
				<thead><tr><th>Módulo</th><th>Plugin</th><th>Estado</th></tr></thead>
				<tbody>
				<?php foreach ( $plugins as $label => $plugin ) : ?>
					<tr><td><?php echo esc_html( $label ); ?></td><td><code><?php echo esc_html( $plugin ); ?></code></td><td><?php echo is_plugin_active( $plugin ) ? '<strong style="color:#16803c">Ativo</strong>' : '<strong style="color:#b32d2e">Inativo</strong>'; ?></td></tr>
				<?php endforeach; ?>
				<tr><td>REST API</td><td><code><?php echo esc_html( rest_url() ); ?></code></td><td><strong style="color:#16803c">Disponível</strong></td></tr>
				<tr><td>WooCommerce</td><td><?php echo defined( 'WC_VERSION' ) ? esc_html( WC_VERSION ) : '—'; ?></td><td><?php echo class_exists( 'WooCommerce' ) ? '<strong style="color:#16803c">Disponível</strong>' : '<strong style="color:#b32d2e">Ausente</strong>'; ?></td></tr>
			</tbody>
			</table>
			<form action="options.php" method="post" class="nutzen-settings-card">
				<?php settings_fields( 'nutzen_switch' ); ?>
				<h2>Módulos</h2>
				<?php foreach ( self::MODULES as $module ) : $key = 'module_' . $module; ?>
					<label style="display:block;margin:10px 0"><input type="checkbox" name="<?php echo esc_attr( self::OPTION . '[' . $key . ']' ); ?>" value="1" <?php checked( '1', $settings[ $key ] ); ?>> <?php echo esc_html( ucfirst( $module ) ); ?></label>
				<?php endforeach; ?>
				<h2>Entrega</h2>
				<label for="nutzen_shipping_subsidy" style="display:block;margin:10px 0 6px"><strong>Subs&iacute;dio nacional por frete (R$)</strong></label>
				<input id="nutzen_shipping_subsidy" name="<?php echo esc_attr( self::OPTION ); ?>[shipping_subsidy]" type="number" min="0" step="0.01" value="<?php echo esc_attr( $settings['shipping_subsidy'] ); ?>">
				<p class="description">A Nutzen absorve este valor em cada cota&ccedil;&atilde;o. At&eacute; o limite, o frete fica gr&aacute;tis; acima dele, o cliente paga somente a diferen&ccedil;a.</p>
				<p class="description">S&atilde;o Paulo Capital e as cidades atendidas pela entrega pr&oacute;pria permanecem gr&aacute;tis para qualquer peso, com corte &agrave;s 11h.</p>
				<h2>Conexões</h2>
				<table class="form-table">
					<tr><th><label for="nutzen_frontend_url">URL do frontend</label></th><td><input class="regular-text" type="url" id="nutzen_frontend_url" name="<?php echo esc_attr( self::OPTION ); ?>[frontend_url]" value="<?php echo esc_attr( $settings['frontend_url'] ); ?>"></td></tr>
					<tr><th><label for="nutzen_wordpress_url">URL do WordPress</label></th><td><input class="regular-text" type="url" id="nutzen_wordpress_url" name="<?php echo esc_attr( self::OPTION ); ?>[wordpress_url]" value="<?php echo esc_attr( $settings['wordpress_url'] ); ?>"></td></tr>
					<tr><th><label for="nutzen_webhook_secret">Segredo do webhook</label></th><td><input class="regular-text" type="password" autocomplete="new-password" id="nutzen_webhook_secret" name="<?php echo esc_attr( self::OPTION ); ?>[webhook_secret]" value="" placeholder="<?php echo $settings['webhook_secret'] ? esc_attr__( 'Configurado — deixe vazio para manter', 'nutzen-switch' ) : ''; ?>"><p class="description">O valor existente nunca é exibido.</p></td></tr>
				</table>
				<?php submit_button(); ?>
			</form>
			<h2>Logs técnicos recentes</h2>
			<pre class="nutzen-log"><?php echo esc_html( implode( "\n", (array) get_option( self::LOG, array() ) ) ); ?></pre>
		</div>
		<?php
	}

	public static function product_changed( int $post_id, WP_Post $post, bool $update ): void {
		if ( wp_is_post_revision( $post_id ) || 'product' !== $post->post_type || ! $update ) {
			return;
		}
		self::send_webhook( array( 'woocommerce-products', 'woocommerce-product-' . $post->post_name ) );
	}

	public static function category_changed(): void {
		self::send_webhook( array( 'woocommerce-products', 'woocommerce-categories' ) );
	}

	public static function subscription_plan_changed( int $post_id, WP_Post $post ): void {
		if ( wp_is_post_revision( $post_id ) || 'nutzen_plan' !== $post->post_type ) return;
		self::send_webhook( array( 'woocommerce-products' ) );
	}

	public static function banner_status_changed( string $new_status, string $old_status, WP_Post $post ): void {
		if ( 'nutzen_banner' === $post->post_type && $new_status !== $old_status ) {
			self::send_webhook( array( 'nutzen-banners' ) );
		}
	}

	/** @param string[] $tags */
	private static function send_webhook( array $tags ): void {
		$settings = self::settings();
		if ( empty( $settings['frontend_url'] ) || empty( $settings['webhook_secret'] ) ) {
			return;
		}
		$payload   = wp_json_encode( array( 'tags' => array_values( array_unique( $tags ) ), 'sent_at' => gmdate( 'c' ) ) );
		$signature = hash_hmac( 'sha256', $payload, $settings['webhook_secret'] );
		$response  = wp_remote_post(
			trailingslashit( $settings['frontend_url'] ) . 'api/revalidate',
			array( 'timeout' => 8, 'headers' => array( 'Content-Type' => 'application/json', 'X-Nutzen-Signature' => $signature ), 'body' => $payload )
		);
		$status = is_wp_error( $response ) ? $response->get_error_message() : 'HTTP ' . wp_remote_retrieve_response_code( $response );
		self::log( 'Webhook de catálogo: ' . $status );
	}

	private static function log( string $message ): void {
		$logs   = (array) get_option( self::LOG, array() );
		$logs[] = '[' . gmdate( 'Y-m-d H:i:s' ) . ' UTC] ' . sanitize_text_field( $message );
		update_option( self::LOG, array_slice( $logs, -50 ), false );
	}

	private static function sessions_table(): string {
		global $wpdb;
		return $wpdb->prefix . 'nutzen_sessions';
	}

	public static function register_rest_routes(): void {
		register_rest_route( 'nutzen/v1', '/banners', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'rest_banners' ), 'permission_callback' => '__return_true' ) );
		register_rest_route( 'nutzen/v1', '/auth/register', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'rest_register' ), 'permission_callback' => '__return_true' ) );
		register_rest_route( 'nutzen/v1', '/auth/login', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'rest_login' ), 'permission_callback' => '__return_true' ) );
		register_rest_route( 'nutzen/v1', '/auth/logout', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'rest_logout' ), 'permission_callback' => array( __CLASS__, 'authenticate_request' ) ) );
		register_rest_route( 'nutzen/v1', '/auth/me', array( 'methods' => array( 'GET', 'POST' ), 'callback' => array( __CLASS__, 'rest_me' ), 'permission_callback' => array( __CLASS__, 'authenticate_request' ) ) );
		register_rest_route( 'nutzen/v1', '/customer/orders', array( 'methods' => 'GET', 'callback' => array( __CLASS__, 'rest_orders' ), 'permission_callback' => array( __CLASS__, 'authenticate_request' ) ) );
		register_rest_route( 'nutzen/v1', '/customer/addresses', array( 'methods' => array( 'GET', 'POST' ), 'callback' => array( __CLASS__, 'rest_addresses' ), 'permission_callback' => array( __CLASS__, 'authenticate_request' ) ) );
		register_rest_route( 'nutzen/v1', '/applications/(?P<type>retailer|affiliate|subscription)', array( 'methods' => 'POST', 'callback' => array( __CLASS__, 'rest_application' ), 'permission_callback' => '__return_true' ) );
	}

	public static function rest_banners(): WP_REST_Response {
		if ( ! self::module_enabled( true, 'banners' ) ) {
			return new WP_REST_Response( array( 'items' => array() ) );
		}
		$posts = get_posts(
			array(
				'post_type'      => 'nutzen_banner',
				'post_status'    => 'publish',
				'posts_per_page' => 30,
				'meta_key'       => '_nutzen_banner_order',
				'orderby'        => array( 'meta_value_num' => 'ASC', 'date' => 'DESC' ),
				'order'          => 'ASC',
			)
		);
		$items = array();
		foreach ( $posts as $post ) {
			$desktop_id = absint( get_post_meta( $post->ID, '_nutzen_banner_desktop_id', true ) );
			$mobile_id  = absint( get_post_meta( $post->ID, '_nutzen_banner_mobile_id', true ) );
			$desktop    = $desktop_id ? wp_get_attachment_image_url( $desktop_id, 'full' ) : '';
			$mobile     = $mobile_id ? wp_get_attachment_image_url( $mobile_id, 'full' ) : '';
			if ( ! $desktop ) continue;
			$items[] = array(
				'id'            => (int) $post->ID,
				'title'         => get_the_title( $post ),
				'alt'           => (string) get_post_meta( $desktop_id, '_wp_attachment_image_alt', true ) ?: get_the_title( $post ),
				'desktop_image' => esc_url_raw( $desktop ),
				'mobile_image'  => esc_url_raw( $mobile ?: $desktop ),
				'link'          => esc_url_raw( (string) get_post_meta( $post->ID, '_nutzen_banner_link', true ) ),
				'order'         => (int) get_post_meta( $post->ID, '_nutzen_banner_order', true ),
			);
		}
		return new WP_REST_Response( array( 'items' => $items ) );
	}

	public static function rest_application( WP_REST_Request $request ) {
		$type    = sanitize_key( (string) $request['type'] );
		if ( ! apply_filters( 'nutzen_application_enabled', true, $type ) ) return new WP_Error( 'nutzen_application_disabled', 'Novas candidaturas estão temporariamente desativadas.', array( 'status' => 403 ) );
		$email   = sanitize_email( (string) $request->get_param( 'email' ) );
		$name    = sanitize_text_field( (string) $request->get_param( 'name' ) );
		$phone   = sanitize_text_field( (string) $request->get_param( 'phone' ) );
		$consent = rest_sanitize_boolean( $request->get_param( 'consent' ) );
		$ip      = sanitize_text_field( (string) ( $_SERVER['REMOTE_ADDR'] ?? '' ) );
		if ( ! self::rate_limit( 'application:' . $type . ':' . $ip, 5, HOUR_IN_SECONDS ) ) return new WP_Error( 'nutzen_rate_limited', 'Muitas solicitações. Tente novamente mais tarde.', array( 'status' => 429 ) );
		if ( ! is_email( $email ) || '' === $name || '' === $phone || ! $consent ) return new WP_Error( 'nutzen_invalid_application', 'Preencha os dados obrigatórios e aceite a Política de Privacidade.', array( 'status' => 400 ) );

		$user_id = 0;
		$session = array();
		if ( 'affiliate' === $type || 'subscription' === $type ) {
			$authorization = isset( $_SERVER['HTTP_AUTHORIZATION'] ) ? trim( (string) $_SERVER['HTTP_AUTHORIZATION'] ) : '';
			if ( $authorization ) {
				$authenticated = self::authenticate_request();
				if ( is_wp_error( $authenticated ) ) return $authenticated;
				$user_id = get_current_user_id();
				$user = get_user_by( 'id', $user_id );
				if ( $user && strtolower( $user->user_email ) !== strtolower( $email ) ) return new WP_Error( 'nutzen_email_mismatch', 'Use o e-mail da conta conectada.', array( 'status' => 409 ) );
			} else {
				$existing = get_user_by( 'email', $email );
				if ( $existing ) return new WP_Error( 'nutzen_login_required', 'Este e-mail já possui conta. Entre antes de enviar a candidatura.', array( 'status' => 409 ) );
				$password = (string) $request->get_param( 'password' );
				if ( strlen( $password ) < 10 ) return new WP_Error( 'nutzen_weak_password', 'Use uma senha com pelo menos 10 caracteres.', array( 'status' => 400 ) );
				$user_id = wc_create_new_customer( $email, '', $password, array( 'first_name' => $name, 'display_name' => $name ) );
				if ( is_wp_error( $user_id ) ) return $user_id;
				$session = self::issue_session( (int) $user_id );
			}
		}

		$existing = get_posts(
			array(
				'post_type'      => 'nutzen_application',
				'post_status'    => 'private',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'meta_query'     => array(
					'relation' => 'AND',
					array( 'key' => '_nutzen_application_type', 'value' => $type ),
					array( 'key' => '_nutzen_application_email', 'value' => $email ),
					array( 'key' => '_nutzen_application_status', 'value' => array( 'pending', 'in_review', 'approved' ), 'compare' => 'IN' ),
				),
			)
		);
		if ( $existing ) return new WP_Error( 'nutzen_application_exists', 'Já existe uma candidatura ativa para este e-mail.', array( 'status' => 409 ) );

		$post_id = wp_insert_post( array( 'post_type' => 'nutzen_application', 'post_status' => 'private', 'post_title' => $name . ' — ' . $email ), true );
		if ( is_wp_error( $post_id ) ) return $post_id;
		self::save_application_meta(
			(int) $post_id,
			array(
				'type' => $type, 'status' => 'pending', 'user_id' => $user_id, 'name' => $name, 'email' => $email, 'phone' => $phone,
				'company' => $request->get_param( 'company' ), 'cnpj' => $request->get_param( 'cnpj' ), 'city' => $request->get_param( 'city' ), 'state' => $request->get_param( 'state' ),
				'website' => $request->get_param( 'website' ), 'social' => $request->get_param( 'social' ), 'audience' => $request->get_param( 'audience' ),
				'experience' => $request->get_param( 'experience' ), 'message' => $request->get_param( 'message' ),
			)
		);
		return new WP_REST_Response( array_merge( array( 'id' => (int) $post_id, 'status' => 'pending', 'message' => 'Candidatura recebida para análise.' ), $session ), 201 );
	}

	private static function rate_limit( string $bucket, int $limit = 8, int $window = 900 ): bool {
		$key   = 'nutzen_rate_' . md5( $bucket );
		$count = (int) get_transient( $key );
		if ( $count >= $limit ) {
			return false;
		}
		set_transient( $key, $count + 1, $window );
		return true;
	}

	private static function issue_session( int $user_id ): array {
		global $wpdb;
		$token   = bin2hex( random_bytes( 32 ) );
		$now     = current_time( 'mysql', true );
		$expires = gmdate( 'Y-m-d H:i:s', time() + DAY_IN_SECONDS * 30 );
		$wpdb->query( $wpdb->prepare( 'DELETE FROM ' . self::sessions_table() . ' WHERE expires_at < %s', $now ) );
		$wpdb->insert( self::sessions_table(), array( 'user_id' => $user_id, 'token_hash' => hash( 'sha256', $token ), 'expires_at' => $expires, 'created_at' => $now, 'last_used_at' => $now ), array( '%d', '%s', '%s', '%s', '%s' ) );
		return array( 'token' => $token, 'expires_at' => $expires );
	}

	private static function bearer_token(): string {
		$body_token = isset( $_POST['_nutzen_session'] ) ? trim( (string) wp_unslash( $_POST['_nutzen_session'] ) ) : '';
		if ( ! $body_token ) {
			$raw_body = file_get_contents( 'php://input' );
			$json_body = is_string( $raw_body ) && '' !== $raw_body ? json_decode( $raw_body, true ) : null;
			$body_token = is_array( $json_body ) && isset( $json_body['_nutzen_session'] ) ? trim( (string) $json_body['_nutzen_session'] ) : '';
		}
		if ( preg_match( '/^[a-f0-9]{64}$/i', $body_token ) ) {
			return strtolower( $body_token );
		}

		$cookie_token = isset( $_COOKIE['nutzen_session'] ) ? trim( (string) $_COOKIE['nutzen_session'] ) : '';
		if ( preg_match( '/^[a-f0-9]{64}$/i', $cookie_token ) ) {
			return strtolower( $cookie_token );
		}

		$proxy_token = isset( $_SERVER['HTTP_X_NUTZEN_SESSION'] ) ? trim( (string) $_SERVER['HTTP_X_NUTZEN_SESSION'] ) : '';
		if ( preg_match( '/^[a-f0-9]{64}$/i', $proxy_token ) ) {
			return strtolower( $proxy_token );
		}

		$header = isset( $_SERVER['HTTP_AUTHORIZATION'] ) ? trim( (string) $_SERVER['HTTP_AUTHORIZATION'] ) : '';
		if ( ! $header && isset( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) ) {
			$header = trim( (string) $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] );
		}
		return preg_match( '/^Bearer\s+([a-f0-9]{64})$/i', $header, $matches ) ? strtolower( $matches[1] ) : '';
	}

	private static function session_user_id( string $token ): int {
		global $wpdb;
		$now = current_time( 'mysql', true );
		$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::sessions_table() . ' WHERE token_hash=%s AND expires_at>%s', hash( 'sha256', $token ), $now ), ARRAY_A );
		if ( ! is_array( $row ) || ! get_user_by( 'id', (int) $row['user_id'] ) ) {
			return 0;
		}
		$wpdb->update( self::sessions_table(), array( 'last_used_at' => $now ), array( 'id' => $row['id'] ), array( '%s' ), array( '%d' ) );
		return (int) $row['user_id'];
	}

	public static function authenticate_bearer_user( $user_id ): int {
		if ( (int) $user_id > 0 ) {
			return (int) $user_id;
		}
		$token = self::bearer_token();
		return $token ? self::session_user_id( $token ) : 0;
	}

	public static function require_customer_account( $order, $errors ): void {
		if ( $order instanceof WC_Order && 0 === (int) $order->get_customer_id() && $errors instanceof WP_Error ) {
			$errors->add( 'nutzen_account_required', 'Entre ou crie sua conta para finalizar a compra.' );
		}
	}

	/**
	 * Mantém a entrega própria gratuita e desconta o subsídio das demais cotações.
	 *
	 * @param array<string, WC_Shipping_Rate> $rates
	 * @param array<string, mixed>            $package
	 * @return array<string, WC_Shipping_Rate>
	 */
	public static function subsidize_shipping_rates( array $rates, array $package ): array {
		if ( self::is_own_delivery_destination( $package ) ) {
			$delivery_time = 'Pagamento aprovado até 11h: entrega no mesmo dia. Após 11h: entrega no próximo dia útil.';
			$own_rate      = new WC_Shipping_Rate(
				'nutzen_own_delivery',
				'Entrega própria — São Paulo e região',
				0,
				array(),
				'nutzen_own_delivery'
			);
			if ( method_exists( $own_rate, 'set_tax_status' ) ) {
				$own_rate->set_tax_status( 'none' );
			}
			if ( method_exists( $own_rate, 'set_delivery_time' ) ) {
				$own_rate->set_delivery_time( $delivery_time );
			}
			return array( $own_rate->get_id() => $own_rate );
		}

		$settings = self::settings();
		$subsidy = max( 0, (float) ( $settings['shipping_subsidy'] ?? 15.90 ) );

		foreach ( $rates as $rate ) {
			if ( ! $rate instanceof WC_Shipping_Rate ) {
				continue;
			}

			$meta          = $rate->get_meta_data();
			$original_cost = isset( $meta['_nutzen_original_shipping_cost'] )
				? max( 0, (float) $meta['_nutzen_original_shipping_cost'] )
				: max( 0, (float) $rate->get_cost() );
			$new_cost      = max( 0, $original_cost - $subsidy );
			$ratio         = $original_cost > 0 ? $new_cost / $original_cost : 0;

			if ( ! isset( $meta['_nutzen_original_shipping_cost'] ) ) {
				$rate->add_meta_data( '_nutzen_original_shipping_cost', (string) $original_cost );
			}
			$rate->add_meta_data( '_nutzen_shipping_subsidy', (string) min( $subsidy, $original_cost ) );
			$rate->set_cost( $new_cost );
			$taxes = array();
			foreach ( (array) $rate->get_taxes() as $tax_id => $tax_value ) {
				$taxes[ $tax_id ] = round( (float) $tax_value * $ratio, function_exists( 'wc_get_price_decimals' ) ? wc_get_price_decimals() : 2 );
			}
			$rate->set_taxes( $taxes );
		}

		return $rates;
	}

	/** @param array<string, mixed> $package */
	private static function is_own_delivery_destination( array $package ): bool {
		$destination = is_array( $package['destination'] ?? null ) ? $package['destination'] : array();
		$state       = strtoupper( (string) ( $destination['state'] ?? '' ) );
		$city        = sanitize_title( (string) ( $destination['city'] ?? '' ) );
		$postcode    = preg_replace( '/\D+/', '', (string) ( $destination['postcode'] ?? '' ) );
		if ( 'SP' !== $state ) {
			return false;
		}

		if ( 'sao-paulo' === $city && 8 === strlen( $postcode ) ) {
			$postcode_number = (int) $postcode;
			return ( $postcode_number >= 1000001 && $postcode_number <= 5999999 )
				|| ( $postcode_number >= 8000000 && $postcode_number <= 8499999 );
		}

		return in_array(
			$city,
			array(
				'santana-de-parnaiba',
				'cotia',
				'itapevi',
				'aruja',
				'caieiras',
				'franco-da-rocha',
				'francisco-morato',
				'poa',
				'ferraz-de-vasconcelos',
				'itaquaquecetuba',
				'suzano',
				'mogi-das-cruzes',
			),
			true
		);
	}

	public static function authenticate_request() {
		global $wpdb;
		$token = self::bearer_token();
		if ( ! $token ) {
			return new WP_Error( 'nutzen_auth_required', 'Autenticação necessária.', array( 'status' => 401 ) );
		}
		$now = current_time( 'mysql', true );
		$row = $wpdb->get_row( $wpdb->prepare( 'SELECT * FROM ' . self::sessions_table() . ' WHERE token_hash=%s AND expires_at>%s', hash( 'sha256', $token ), $now ), ARRAY_A );
		if ( ! is_array( $row ) || ! get_user_by( 'id', (int) $row['user_id'] ) ) {
			return new WP_Error( 'nutzen_invalid_session', 'Sessão inválida ou expirada.', array( 'status' => 401 ) );
		}
		$wpdb->update( self::sessions_table(), array( 'last_used_at' => $now ), array( 'id' => $row['id'] ), array( '%s' ), array( '%d' ) );
		wp_set_current_user( (int) $row['user_id'] );
		return true;
	}

	public static function rest_register( WP_REST_Request $request ) {
		if ( 'yes' !== get_option( 'woocommerce_enable_myaccount_registration', 'no' ) ) {
			return new WP_Error( 'nutzen_registration_disabled', 'O cadastro de clientes está desativado.', array( 'status' => 403 ) );
		}
		$email    = sanitize_email( (string) $request->get_param( 'email' ) );
		$password = (string) $request->get_param( 'password' );
		$name     = sanitize_text_field( (string) $request->get_param( 'name' ) );
		$ip       = sanitize_text_field( (string) ( $_SERVER['REMOTE_ADDR'] ?? '' ) );
		if ( ! self::rate_limit( 'register:' . $ip ) ) return new WP_Error( 'nutzen_rate_limited', 'Muitas tentativas. Aguarde alguns minutos.', array( 'status' => 429 ) );
		if ( ! is_email( $email ) || strlen( $password ) < 10 || email_exists( $email ) ) return new WP_Error( 'nutzen_invalid_registration', 'Revise o e-mail e use uma senha com pelo menos 10 caracteres.', array( 'status' => 400 ) );
		$user_id = wc_create_new_customer( $email, '', $password, array( 'first_name' => $name, 'display_name' => $name ) );
		if ( is_wp_error( $user_id ) ) return $user_id;
		return new WP_REST_Response( array_merge( array( 'user' => self::user_payload( (int) $user_id ) ), self::issue_session( (int) $user_id ) ), 201 );
	}

	public static function rest_login( WP_REST_Request $request ) {
		$login    = sanitize_text_field( (string) $request->get_param( 'email' ) );
		$password = (string) $request->get_param( 'password' );
		$ip       = sanitize_text_field( (string) ( $_SERVER['REMOTE_ADDR'] ?? '' ) );
		if ( ! self::rate_limit( 'login:' . $ip . ':' . strtolower( $login ) ) ) return new WP_Error( 'nutzen_rate_limited', 'Muitas tentativas. Aguarde alguns minutos.', array( 'status' => 429 ) );
		$user = wp_authenticate( $login, $password );
		if ( is_wp_error( $user ) ) return new WP_Error( 'nutzen_invalid_credentials', 'E-mail ou senha inválidos.', array( 'status' => 401 ) );
		return new WP_REST_Response( array_merge( array( 'user' => self::user_payload( $user->ID ) ), self::issue_session( $user->ID ) ) );
	}

	public static function rest_logout(): WP_REST_Response {
		global $wpdb;
		$wpdb->delete( self::sessions_table(), array( 'token_hash' => hash( 'sha256', self::bearer_token() ) ), array( '%s' ) );
		return new WP_REST_Response( array( 'logged_out' => true ) );
	}

	/** @return array<string, mixed> */
	private static function user_payload( int $user_id ): array {
		$user = get_user_by( 'id', $user_id );
		return array( 'id' => $user_id, 'email' => $user->user_email, 'name' => $user->display_name, 'first_name' => get_user_meta( $user_id, 'first_name', true ), 'last_name' => get_user_meta( $user_id, 'last_name', true ) );
	}

	public static function rest_me( WP_REST_Request $request ): WP_REST_Response {
		if ( 'POST' === $request->get_method() ) {
			$first_name = sanitize_text_field( (string) $request->get_param( 'first_name' ) );
			$last_name  = sanitize_text_field( (string) $request->get_param( 'last_name' ) );
			update_user_meta( get_current_user_id(), 'first_name', $first_name );
			update_user_meta( get_current_user_id(), 'last_name', $last_name );
			wp_update_user( array( 'ID' => get_current_user_id(), 'display_name' => trim( $first_name . ' ' . $last_name ) ) );
		}
		return new WP_REST_Response( array( 'user' => self::user_payload( get_current_user_id() ) ) );
	}

	public static function rest_orders(): WP_REST_Response {
		$orders = wc_get_orders( array( 'customer_id' => get_current_user_id(), 'limit' => 50, 'orderby' => 'date', 'order' => 'DESC' ) );
		$items  = array_map( static function ( WC_Order $order ): array { return array( 'id' => $order->get_id(), 'number' => $order->get_order_number(), 'status' => $order->get_status(), 'date' => $order->get_date_created() ? $order->get_date_created()->date( DATE_ATOM ) : null, 'currency' => $order->get_currency(), 'total' => $order->get_total(), 'payment_method' => $order->get_payment_method_title() ); }, $orders );
		return new WP_REST_Response( array( 'items' => $items ) );
	}

	public static function rest_addresses( WP_REST_Request $request ): WP_REST_Response {
		$user_id = get_current_user_id();
		$fields  = array( 'first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'email', 'phone' );
		if ( 'POST' === $request->get_method() ) {
			foreach ( array( 'billing', 'shipping' ) as $type ) {
				$data = $request->get_param( $type );
				if ( ! is_array( $data ) ) continue;
				foreach ( $fields as $field ) {
					if ( array_key_exists( $field, $data ) ) update_user_meta( $user_id, $type . '_' . $field, 'email' === $field ? sanitize_email( $data[ $field ] ) : sanitize_text_field( $data[ $field ] ) );
				}
			}
		}
		$output = array();
		foreach ( array( 'billing', 'shipping' ) as $type ) foreach ( $fields as $field ) $output[ $type ][ $field ] = (string) get_user_meta( $user_id, $type . '_' . $field, true );
		return new WP_REST_Response( $output );
	}
}

Nutzen_Switch_Plugin::bootstrap();
