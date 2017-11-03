'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter, Link } = require('react-router-dom');
const citationStyles = require('../constants/citation-styles');

const Popover = require('react-popover');
const { Toolbar, ToolGroup } = require('zotero-web-library/lib/component/ui/toolbars');
const UrlInput = require('./url-input');
const Button = require('zotero-web-library/lib/component/ui/button');
const StyleSelector = require('./style-selector');
const ExportDialog = require('./export-dialog');
const Icon = require('zotero-web-library/lib/component/ui/icon');
const Spinner = require('zotero-web-library/lib/component/ui/spinner');
const ClipboardButton = require('react-clipboard.js');

class Controls extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isExportDialogOpen: false,
			isPermalinkDialogOpen: false,
			clipboardConfirmation: false
		};
		this.handleDocumentClick = this.handleDocumentClick.bind(this);
	}

	componentDidMount() {
		window.addEventListener(
			'click',
			this.handleDocumentClick
		);
	}

	componentWillUnmount() {
		window.removeEventListener('click', this.handleDocumentClick);
	}

	handleDocumentClick(ev) {
		if(!ev.target.closest('.export-button') && !ev.target.closest('.export-dialog-popover')) {
			this.setState({ isExportDialogOpen: false });
		}

		if(!ev.target.closest('.permalink-button') && !ev.target.closest('.permalink-dialog-popover')) {
			this.handlePermalinkDialogClose();
		}
	}

	handlePermalinkDialog() {
		this.setState({ 
			isPermalinkDialogOpen: !this.state.isPermalinkDialogOpen
		}, async () => {
			if(!this.props.permalink) {
				this.props.onSave();
			}
		});
	}

	handlePermalinkDialogClose() {
		this.setState({
			isPermalinkDialogOpen: false,
			clipboardConfirmation: false
		});
	}

	handleClipoardSuccess() {
		if(this.state.clipboardConfirmation) {
			return;
		}

		this.setState({
			clipboardConfirmation: true
		}, () => {
			setTimeout(this.handlePermalinkDialogClose.bind(this), 500);
		});
	}

	render() {
		return (
			<div>
				<Toolbar className="hidden-xs-down toolbar-large">
					<div className="toolbar-left">
						<StyleSelector
							citationStyle={ this.props.citationStyle }
							citationStyles= { citationStyles }
							onCitationStyleChanged={ this.props.onCitationStyleChanged }
						/>
					</div>
					<div className="toolbar-right">
						<Link to={ `${this.props.match.url}editor/` }>
							<Button>
								Manual Entry
							</Button>
						</Link>
						<Popover 
							className="permalink-dialog-popover"
							isOpen={ this.state.isPermalinkDialogOpen }
							preferPlace="end"
							place="below"
							body={
									this.props.permalink ? (
										<div className="permalink-dialog">
											<input value={ this.props.permalink } readOnly />
											<ClipboardButton
												className="btn"
												data-clipboard-text={ this.props.permalink }
												onSuccess={ this.handleClipoardSuccess.bind(this) }
											>
												{ this.state.clipboardConfirmation ? 'Copied!' : 'Copy' }
											</ClipboardButton>
										</div>
									) : (
										<div className="permalink-dialog">
											Please Wait...
											<Spinner />
										</div>
									)
							}
						>
							<Button
								className="btn btn-drop-down permalink-button"
								onClick={ this.handlePermalinkDialog.bind(this) }
							>
								Get Permalink
							</Button>
						</Popover>
						<Popover
							className="export-dialog-popover"
							isOpen={ this.state.isExportDialogOpen }
							preferPlace="end"
							place="below"
							body={
								<ExportDialog
									onExported={ () => this.setState({ isExportDialogOpen: false }) }
									getExportData={ this.props.getExportData }
								/>
							}
						>
							<Button 
								className="btn btn-drop-down export-button"
								onClick={ () => this.setState({ isExportDialogOpen: !this.state.isExportDialogOpen }) }
							>
								Export
							</Button>
						</Popover>
					</div>
				</Toolbar>
				<Toolbar className="hidden-sm-up">
					<div className="toolbar-left">
						<ToolGroup>
							<Link to={ `${this.props.match.url}editor/` }>
								<Button>
									<Icon type={ '16/new' } width="16" height="16" />
								</Button>
							</Link>
							<Link to={ `${this.props.match.url}export-dialog/` }>
								<Button>
									<Icon type={ '16/export' } width="16" height="16" />
								</Button>
							</Link>
							<Link to={ `${this.props.match.url}style-selector/` }>
								<Button>
									<Icon type={ '16/cog' } width="16" height="16" />
								</Button>
							</Link>
						</ToolGroup>
					</div>
				</Toolbar>
				<UrlInput
					url={ this.props.url }
					isTranslating={ this.props.isTranslating }
					onTranslationRequest={ this.props.onTranslationRequest }
				/>
			</div>
		);
	}
	
	static propTypes = {
		citations: PropTypes.object,
		citationStyle: PropTypes.string,
		getExportData: PropTypes.func.isRequired,
		isTranslating: PropTypes.bool,
		match: PropTypes.object,
		onCitationStyleChanged: PropTypes.func.isRequired,
		onSave: PropTypes.func.isRequired,
		onTranslationRequest: PropTypes.func.isRequired,
		permalink: PropTypes.string,
		url: PropTypes.string,
	}
}

module.exports = withRouter(Controls);